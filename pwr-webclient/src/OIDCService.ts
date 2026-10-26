import {store} from './reducers/reducerIndex';
import {CrossCuttingAsyncActionCreator} from './reducers/crosscutting/CrossCuttingAsyncActionCreator';
import {MSALInstance} from './MSALInstance';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';
import {Paths} from './Paths';
import {CONFIG} from './Config';
import {AccountInfo, AuthenticationResult} from '@azure/msal-common';
import {BrowserAuthErrorMessage, InteractionRequiredAuthError} from '@azure/msal-browser';
import {confirmLeavingUnsavedChanges} from './reducers/navigation/UnsavedChanges';
import {CrossCuttingActionCreator} from './reducers/crosscutting/CrossCuttingActionCreator';
import {Alerts} from './utils/Alerts';
import {PowerLocalize} from './localization/PowerLocalizer';

const LOCAL_DEV_USER_NAME = 'Local Developer';

/**
 * Set before an automatic redirect to Microsoft, removed by a successful login: still there on return means the
 * attempt failed, so the login page shows its button instead of redirecting again (no loop) (#129)
 */
const AUTO_LOGIN_STARTED = 'pwr.autoLoginStarted';
/** Set by logging out: the login page then waits for the button, otherwise logging out would log in again (#129) */
const LOGGED_OUT = 'pwr.loggedOut';

export interface LoggedInAccount {
    name: string;
    /** The login, usually the e-mail address */
    username: string;
    roles: Array<string>;
    /** The initials of the own profile, from the claim mailnickname; undefined if the token has none (#135) */
    initials?: string;
    /** The names of the claims of the ID token, without their values: for the analysis when the initials are missing (#348) */
    claimNames?: Array<string>;
}

/**
 * The claim with the initials, regardless of how its name is cased
 */
function initialsClaim(claims: object | undefined): string | undefined {
    const key = Object.keys(claims || {}).find(name => name.toLowerCase() === 'mailnickname');
    const value = key ? claims[key] : undefined;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim().toLowerCase() : undefined;
}

/**
 * Whether only a new login gets a token: MSAL wants an interaction, or knows no account (fresh tab). Anything else,
 * like a network error, only fails the call (#311)
 */
function requiresLogin(error: any): boolean {
    return error instanceof InteractionRequiredAuthError
        || (!!error && error.errorCode === BrowserAuthErrorMessage.noAccountError.code);
}

/** The browser didn't open the popup: only the redirect is left */
function popupBlocked(error: any): boolean {
    return !!error && (error.errorCode === BrowserAuthErrorMessage.popupWindowError.code
        || error.errorCode === BrowserAuthErrorMessage.emptyWindowError.code);
}

/**
 * The requests that waited for a new login fail with it when the login didn't happen (cancelled, logged out, another
 * account). What happened was already shown once, so the clients show nothing for it (#323).
 */
export class LoginNotCompletedError extends Error {
    constructor(message: string) {
        super(message);
        // instanceof works for subclasses of Error only with their prototype, also when transpiled for old browsers
        Object.setPrototypeOf(this, LoginNotCompletedError.prototype);
    }
}

interface PendingLogin {
    resolve(token: string): void;

    reject(error: any): void;
}

export class OIDCService {

    private readonly msalInstance: MSALInstance;
    private static _instance?: OIDCService;
    /** The login a return from Microsoft brought, null if there was none */
    private redirectHandled: Promise<AuthenticationResult | null>;
    /** A login started by a failed token request is being asked about or under way */
    private loginAgainPending = false;
    /** A redirect to Microsoft has started, the page is about to leave */
    private loginStarted = false;
    /** The new login all requests that need one wait for (#323), null if none is under way */
    private reauthentication: Promise<string> | null = null;
    /** Settles the new login while the SessionExpiredDialog asks; functions do not belong into the store */
    private pendingLogin: PendingLogin | null = null;
    private loginPopupOpen = false;
    /** The login of the account seen last: the hint for a new login, even if MSAL has lost the account */
    private lastUsername?: string;

    constructor() {
        if (CONFIG.LOCAL_DEV) {
            console.warn('Local dev mode: Azure authentication is disabled');
            return;
        }
        this.msalInstance = MSALInstance.instance();
        this.redirectHandled = this.msalInstance.accessMsal().handleRedirectPromise()
            .then(tokenResponse => {
                if (!tokenResponse || !tokenResponse.account) {
                    return null;
                }
                sessionStorage.removeItem(AUTO_LOGIN_STARTED);
                this.msalInstance.accessMsal().setActiveAccount(tokenResponse.account);
                this.remember(tokenResponse.account);
                store.dispatch(CrossCuttingAsyncActionCreator.AsyncLogInUser(tokenResponse) as any);
                return tokenResponse;
            })
            .catch(error => {
                console.log('Login error', error);
                return null;
            });
    }

    public static instance(): OIDCService {
        if (!this._instance) {
            this._instance = new OIDCService();
        }
        return this._instance;
    }

    /**
     * Performs a manual login request for a new user.
     */
    public login(): void {
        if (CONFIG.LOCAL_DEV) {
            store.dispatch(CrossCuttingAsyncActionCreator.AsyncLogInLocalUser(true) as any);
            return;
        }
        sessionStorage.removeItem(LOGGED_OUT);
        this.startLogin();
    }

    public logout(): void {
        if (CONFIG.LOCAL_DEV) {
            store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT) as any);
            return;
        }
        sessionStorage.setItem(LOGGED_OUT, 'true');
        this.msalInstance.accessMsal().logoutRedirect({account: this.msalInstance.accessMsal().getActiveAccount()})
    }

    /**
     * Attempts to just renew a login if possible.
     * If that process works, required data is loaded and written into the store.
     * If it does not, the login at Microsoft starts right away (#129); after a failed attempt or after logging out
     * the login page with its button appears instead.
     * Waits for a return from Microsoft first: a redirect must not start while MSAL still handles one.
     */
    public renewLogin(): void {
        if (CONFIG.LOCAL_DEV) {
            store.dispatch(CrossCuttingAsyncActionCreator.AsyncLogInLocalUser(false) as any);
            return;
        }
        this.redirectHandled.then(fromRedirect => {
            if (fromRedirect) {
                // Just logged in by the return from Microsoft
                return;
            }
            console.log('Attempting to renew login');
            this.msalInstance.acquireTokenSilent()
                .then((response) => {
                    sessionStorage.removeItem(AUTO_LOGIN_STARTED);
                    this.remember(response.account);
                    store.dispatch(CrossCuttingAsyncActionCreator.AsyncRenewLogin(response) as any);
                    console.log('Login renewed silently.', response);
                })
                .catch((error) => {
                    console.log('Failed to renew login silently', error);
                    this.loginAutomaticallyOrShowLoginPage();
                });
        });
    }

    private startLogin(): void {
        this.loginStarted = true;
        this.msalInstance.doLogin();
    }

    private loginAutomaticallyOrShowLoginPage(): void {
        const attemptFailed = sessionStorage.getItem(AUTO_LOGIN_STARTED) !== null;
        sessionStorage.removeItem(AUTO_LOGIN_STARTED);
        if (!attemptFailed && sessionStorage.getItem(LOGGED_OUT) === null) {
            sessionStorage.setItem(AUTO_LOGIN_STARTED, 'true');
            this.startLogin();
            return;
        }
        store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT) as any);
    }

    /**
     * Resolves to undefined in local dev mode, as there is no token to send.
     * Waits for a return from Microsoft first, which sets the active account. A failure never logs out (#311). If
     * MSAL needs a login, the request waits for one without leaving the page (#323): silently if Microsoft still has
     * a session, otherwise the SessionExpiredDialog offers it in a popup. With the new login the request goes on;
     * without it, it fails with a LoginNotCompletedError.
     */
    public getToken(): Promise<string | undefined> {
        if (CONFIG.LOCAL_DEV) {
            return Promise.resolve(undefined);
        }
        return this.redirectHandled
            .then(() => this.msalInstance.getToken())
            .catch(error => {
                if (!requiresLogin(error)) {
                    throw error;
                }
                return this.reauthenticate();
            });
    }

    /**
     * One new login for all requests that need one at the same time
     */
    private reauthenticate(): Promise<string> {
        if (!this.reauthentication) {
            const done = () => this.reauthentication = null;
            this.reauthentication = this.loginWithoutLeaving().then(token => {
                done();
                return token;
            }, error => {
                done();
                throw error;
            });
        }
        return this.reauthentication;
    }

    private loginWithoutLeaving(): Promise<string> {
        if (this.loginStarted || sessionStorage.getItem(LOGGED_OUT) !== null) {
            // The page is leaving for Microsoft anyway, or nobody wants to be logged in
            return Promise.reject(new LoginNotCompletedError('No new login'));
        }
        return this.msalInstance.ssoSilent(this.loginHint())
            .then(result => this.adopt(result))
            .catch(error => {
                if (error instanceof LoginNotCompletedError) {
                    throw error;
                }
                console.log('No silent login, asking for one', error);
                return new Promise<string>((resolve, reject) => {
                    this.pendingLogin = {resolve, reject};
                    store.dispatch(CrossCuttingActionCreator.openSessionExpiredDialog());
                });
            });
    }

    /**
     * Erneut anmelden in the SessionExpiredDialog. Opens the popup right in the click, which is the only moment the
     * browser allows it. If it blocks the popup anyway, the redirect is left (asking about unsaved changes first).
     */
    public loginInPopup(): void {
        const pending = this.pendingLogin;
        if (!pending || this.loginPopupOpen) {
            return;
        }
        this.loginPopupOpen = true;
        this.msalInstance.acquireTokenPopup(this.loginHint())
            .then(result => {
                this.loginPopupOpen = false;
                this.closeLoginDialog();
                pending.resolve(this.adopt(result));
            })
            .catch(error => {
                this.loginPopupOpen = false;
                this.closeLoginDialog();
                if (error instanceof LoginNotCompletedError) {
                    pending.reject(error);
                    return;
                }
                console.log('Login in the popup failed', error);
                if (popupBlocked(error)) {
                    this.loginAgain();
                } else {
                    Alerts.showError(PowerLocalize.get(error && error.errorCode === BrowserAuthErrorMessage.userCancelledError.code
                        ? 'SessionExpired.Cancelled' : 'SessionExpired.Failed'));
                }
                pending.reject(new LoginNotCompletedError('No new login'));
            });
    }

    /**
     * Abbrechen in the SessionExpiredDialog: the waiting requests fail, with one message for all of them
     */
    public cancelLoginInPopup(): void {
        const pending = this.pendingLogin;
        if (!pending) {
            return;
        }
        this.closeLoginDialog();
        Alerts.showError(PowerLocalize.get('SessionExpired.Cancelled'));
        pending.reject(new LoginNotCompletedError('Cancelled'));
    }

    private closeLoginDialog(): void {
        this.pendingLogin = null;
        store.dispatch(CrossCuttingActionCreator.closeSessionExpiredDialog());
    }

    /**
     * Takes over the account of a new login and returns its token. Another account than before starts the app anew:
     * what the page shows belongs to the previous one.
     */
    private adopt(result: AuthenticationResult): string {
        const previous = this.lastUsername;
        if (previous && result.account && result.account.username.toLowerCase() !== previous.toLowerCase()) {
            window.location.assign(Paths.START);
            throw new LoginNotCompletedError('Another account');
        }
        sessionStorage.removeItem(AUTO_LOGIN_STARTED);
        this.msalInstance.accessMsal().setActiveAccount(result.account);
        this.remember(result.account);
        return result.accessToken;
    }

    private loginHint(): string | undefined {
        const msal = this.msalInstance.accessMsal();
        const account = msal.getActiveAccount() || msal.getAllAccounts()[0];
        return (account && account.username) || this.lastUsername;
    }

    private remember(account: AccountInfo | null): void {
        if (account && account.username) {
            this.lastUsername = account.username;
        }
    }

    /**
     * Starts the login again by a redirect, after asking about unsaved changes (#311): where MSAL has no account any
     * more although the app counts as logged in (start page), or if the browser blocks the popup (#323). The app
     * continues on the page it left. Once for all calls that fail together, and not while a login started elsewhere
     * (renewLogin) is under way
     */
    public loginAgain(): void {
        if (this.loginAgainPending || this.loginStarted) {
            return;
        }
        this.loginAgainPending = true;
        const done = () => this.loginAgainPending = false;
        store.dispatch(confirmLeavingUnsavedChanges(() => {
            this.loginAutomaticallyOrShowLoginPage();
            done();
        }, done) as any);
    }

    /**
     * The account that is logged in, null if none is. In local dev mode the local user, who has admin rights.
     * Without the claims of its ID token MSAL knows the account only by halves: no roles, no initials, so null too
     * (#311).
     */
    public getCurrentAccount(): LoggedInAccount | null {
        if (CONFIG.LOCAL_DEV) {
            return {name: LOCAL_DEV_USER_NAME, username: '', roles: ['Power.User', 'Power.Admin']};
        }
        const account = this.msalInstance.accessMsal().getActiveAccount();
        if (!account || !account.idTokenClaims) {
            return null;
        }
        this.remember(account);
        const roles = (account.idTokenClaims && account.idTokenClaims.roles) || [];
        return {
            name: account.name, username: account.username, roles, initials: initialsClaim(account.idTokenClaims),
            claimNames: Object.keys(account.idTokenClaims)
        };
    }

    /**
     * Whether the logged-in account may open the profile with these initials: an admin every one, a user only the own
     * (#255). The services check the same; this spares the user their errors.
     */
    public mayOpenProfile(initials: string): boolean {
        const account = this.getCurrentAccount();
        if (!account) {
            return false;
        }
        if (account.roles.includes('Power.Admin')) {
            return true;
        }
        return !!account.initials && !!initials && account.initials.toLowerCase() === initials.toLowerCase();
    }

    public getCurrentUserName(): string {
        if (CONFIG.LOCAL_DEV) {
            return LOCAL_DEV_USER_NAME;
        }
        return this.msalInstance.accessMsal().getActiveAccount().name;
    }
}
