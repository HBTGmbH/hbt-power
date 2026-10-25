import * as Msal from '@azure/msal-browser';
import {PopupRequest, RedirectRequest, SilentRequest, SsoSilentRequest} from '@azure/msal-browser';
import {AuthenticationResult} from '@azure/msal-common';
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

    /**
     * Fails with the error of MSAL; what follows from it decides OIDCService, never a logout (#311)
     */
    public getToken(): Promise<string> {
        const loginRequest: SilentRequest = {
            scopes: this.scopes,
            redirectUri: window.location.origin,
        }
        return this.msalInstance.acquireTokenSilent(loginRequest)
            .then(value => value.accessToken)
            .catch((error) => {
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

    /**
     * @param redirectStartPage where the app continues after the return from Microsoft; the page starting the login if
     * not given
     */
    public doLogin(redirectStartPage?: string): void {
        const loginRequest: RedirectRequest = {
            scopes: this.scopes,
            redirectStartPage,
        }
        this.accessMsal().loginRedirect(loginRequest);
    }

    /**
     * A new login without any interaction, if Microsoft still has a session (#323)
     */
    public ssoSilent(loginHint?: string): Promise<AuthenticationResult> {
        const request: SsoSilentRequest = {
            scopes: this.scopes,
            loginHint,
        }
        return this.msalInstance.ssoSilent(request);
    }

    /**
     * A new login in a popup (#323). Browsers only open it in reaction to a click, so call it right from the click
     * handler, without waiting for anything before.
     */
    public acquireTokenPopup(loginHint?: string): Promise<AuthenticationResult> {
        const request: PopupRequest = {
            scopes: this.scopes,
            loginHint,
        }
        return this.msalInstance.acquireTokenPopup(request);
    }

    /**
     * Whether this window is a popup MSAL opened for a login: MSAL in the opener reads the answer from its URL and
     * closes it, the app must not start in it (#323)
     */
    public static isLoginPopup(): boolean {
        return !!window.opener && window.opener !== window && typeof window.name === 'string'
            && window.name.indexOf('msal.') === 0;
    }

}
