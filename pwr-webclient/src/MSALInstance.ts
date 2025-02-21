import * as Msal from '@azure/msal-browser';
import {RedirectRequest, SilentRequest} from '@azure/msal-browser';
import {AuthenticationResult} from '@azure/msal-common';
import {store} from './reducers/reducerIndex';
import {CrossCuttingAsyncActionCreator} from './reducers/crosscutting/CrossCuttingAsyncActionCreator';
import {CONFIG} from './Config';

/**
 * Instance of MSAL; Only supposed to be accessed through OIDCService
 */
export class MSALInstance {
    private static _instance?: MSALInstance;
    private readonly config: Msal.Configuration = {
        auth: {
            authority: `https://login.microsoftonline.com/${CONFIG.AZURE_TENANT_ID}`,
            clientId: CONFIG.AZURE_CLIENT_ID,
            redirectUri: `${window.location.origin}`
        },
    };
    private readonly msalInstance: Msal.PublicClientApplication;
    private readonly scopes = ['openid', 'offline_access', `api://${CONFIG.AZURE_CLIENT_ID}/pwr-access`];

    constructor() {
        this.msalInstance = new Msal.PublicClientApplication(this.config);
        this.msalInstance.initialize();
    }

    public static instance() {
        if (!this._instance) {
            this._instance = new MSALInstance();
        }
        return this._instance;
    }

    public accessMsal(): Msal.PublicClientApplication  {
        return this.msalInstance;
    }

    public getToken(): Promise<string> {
        const loginRequest: SilentRequest = {
            scopes: this.scopes,
            redirectUri: window.location.origin,
        }
        return this.msalInstance.acquireTokenSilent(loginRequest)
            .then(value => value.accessToken)
            .catch((error) => {
                store.dispatch(CrossCuttingAsyncActionCreator.AsyncLogOutUser() as any);
                console.log('Failed to getToken', error);
                throw error;
            })
    }

    public acquireTokenSilent(): Promise<AuthenticationResult> {
        const loginRequest: SilentRequest = {
            scopes: this.scopes,
        }
        return this.msalInstance.acquireTokenSilent(loginRequest);
    }

    public doLogin(): void {
        const loginRequest: RedirectRequest = {
            scopes: this.scopes,
        }
        this.accessMsal().loginRedirect(loginRequest);
    }

}
