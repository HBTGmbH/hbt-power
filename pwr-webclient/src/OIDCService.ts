import {store} from './reducers/reducerIndex';
import {CrossCuttingAsyncActionCreator} from './reducers/crosscutting/CrossCuttingAsyncActionCreator';
import {MSALInstance} from './MSALInstance';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';
import {Paths} from './Paths';

export class OIDCService {

    private readonly msalInstance: MSALInstance;
    private static _instance?: OIDCService;

    constructor() {
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
        this.msalInstance.doLogin();
    }

    public logout(): void {
        this.msalInstance.accessMsal().logoutRedirect({account: this.msalInstance.accessMsal().getActiveAccount()})
    }

    /**
     * Attempts to just renew a login if possible.
     * If that process works, required data is loaded and written into the store.
     * If that process does not work we redirect back to the login page.
     */
    public renewLogin(): void {
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

    public getToken(): Promise<string> {
        return this.msalInstance.getToken();
    }

    public getCurrentUserName(): string {
        return this.msalInstance.accessMsal().getActiveAccount().name;
    }
}
