import {store} from './reducers/reducerIndex';
import {CrossCuttingAsyncActionCreator} from './reducers/crosscutting/CrossCuttingAsyncActionCreator';
import {MSALInstance} from './MSALInstance';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';
import {Paths} from './Paths';
import {CONFIG} from './Config';
import {AuthenticationResult} from '@azure/msal-common';
import {BrowserAuthErrorMessage, InteractionRequiredAuthError} from '@azure/msal-browser';
import {confirmLeavingUnsavedChanges} from './reducers/navigation/UnsavedChanges';

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
export function requiresLogin(error: any): boolean {
    return error instanceof InteractionRequiredAuthError
        || (!!error && error.errorCode === BrowserAuthErrorMessage.noAccountError.code);
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
     * Waits for a return from Microsoft first, which sets the active account. A failure never logs out (#311): if
     * MSAL needs a login, the login starts again (after asking about unsaved changes); the call fails either way.
     */
    public getToken(): Promise<string | undefined> {
        if (CONFIG.LOCAL_DEV) {
            return Promise.resolve(undefined);
        }
        return this.redirectHandled
            .then(() => this.msalInstance.getToken())
            .catch(error => {
                if (requiresLogin(error)) {
                    this.loginAgain();
                }
                throw error;
            });
    }

    /**
     * Starts the login again where MSAL has no account any more although the app counts as logged in, after asking
     * about unsaved changes (#311). Once for all calls that fail together, and not while a login started elsewhere
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
        const roles = (account.idTokenClaims && account.idTokenClaims.roles) || [];
        return {name: account.name, username: account.username, roles, initials: initialsClaim(account.idTokenClaims)};
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
