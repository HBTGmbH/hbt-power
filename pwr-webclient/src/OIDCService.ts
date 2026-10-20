import {store} from './reducers/reducerIndex';
import {CrossCuttingAsyncActionCreator} from './reducers/crosscutting/CrossCuttingAsyncActionCreator';
import {MSALInstance} from './MSALInstance';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';
import {Paths} from './Paths';
import {CONFIG} from './Config';

const LOCAL_DEV_USER_NAME = 'Local Developer';

export interface LoggedInAccount {
    name: string;
    /** The login, usually the e-mail address */
    username: string;
    roles: Array<string>;
}

export class OIDCService {

    private readonly msalInstance: MSALInstance;
    private static _instance?: OIDCService;

    constructor() {
        if (CONFIG.LOCAL_DEV) {
            console.warn('Local dev mode: Azure authentication is disabled');
            return;
        }
        this.msalInstance = MSALInstance.instance();
        this.msalInstance.accessMsal().handleRedirectPromise()
            .then(tokenResponse => {
                if (!tokenResponse) {
                    return;
                }
                if (!tokenResponse.account) {
                    return;
                }
                this.msalInstance.accessMsal().setActiveAccount(tokenResponse.account);
                store.dispatch(CrossCuttingAsyncActionCreator.AsyncLogInUser(tokenResponse) as any);
            })
            .catch(error => {
                console.log('Login error', error);
            })
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
        this.msalInstance.doLogin();
    }

    public logout(): void {
        if (CONFIG.LOCAL_DEV) {
            store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT) as any);
            return;
        }
        this.msalInstance.accessMsal().logoutRedirect({account: this.msalInstance.accessMsal().getActiveAccount()})
    }

    /**
     * Attempts to just renew a login if possible.
     * If that process works, required data is loaded and written into the store.
     * If that process does not work we redirect back to the login page.
     */
    public renewLogin(): void {
        if (CONFIG.LOCAL_DEV) {
            store.dispatch(CrossCuttingAsyncActionCreator.AsyncLogInLocalUser(false) as any);
            return;
        }
        console.log('Attempting to renew login');
        this.msalInstance.acquireTokenSilent()
            .then((response) => {
                store.dispatch(CrossCuttingAsyncActionCreator.AsyncRenewLogin(response) as any);
                console.log('Login renewed silently.', response);
            })
            .catch((error) => {
                // FIXME we need proper handling here. Show error to user and so  on. Not just silently go back to login
                console.log('Failed to renew login silently, going back to login', error);
                store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT) as any);
            })
    }

    /**
     * Resolves to undefined in local dev mode, as there is no token to send.
     */
    public getToken(): Promise<string | undefined> {
        if (CONFIG.LOCAL_DEV) {
            return Promise.resolve(undefined);
        }
        return this.msalInstance.getToken();
    }

    /**
     * The account that is logged in, null if none is. In local dev mode the local user, who has admin rights.
     */
    public getCurrentAccount(): LoggedInAccount | null {
        if (CONFIG.LOCAL_DEV) {
            return {name: LOCAL_DEV_USER_NAME, username: '', roles: ['Power.User', 'Power.Admin']};
        }
        const account = this.msalInstance.accessMsal().getActiveAccount();
        if (!account) {
            return null;
        }
        const roles = (account.idTokenClaims && account.idTokenClaims.roles) || [];
        return {name: account.name, username: account.username, roles};
    }

    public getCurrentUserName(): string {
        if (CONFIG.LOCAL_DEV) {
            return LOCAL_DEV_USER_NAME;
        }
        return this.msalInstance.accessMsal().getActiveAccount().name;
    }
}
