declare const POWER_APP_PATH: string;
declare const POWER_AZURE_TENANT_ID: string;
declare const POWER_AZURE_CLIENT_ID: string;

export class CONFIG {
    public static readonly APP_PATH: string = POWER_APP_PATH;
    public static readonly AZURE_TENANT_ID = POWER_AZURE_TENANT_ID;
    public static readonly AZURE_CLIENT_ID = POWER_AZURE_CLIENT_ID;
    /**
     * Set by `npm run start:local`: talk to the local services without the edge service and skip Azure authentication.
     * Inlined at build time, so a production build can never enable it.
     */
    public static readonly LOCAL_DEV = process.env.REACT_APP_LOCAL_DEV === 'true';
    /**
     * Local dev only: the initials of a user without admin role to act as (#350), e.g.
     * `REACT_APP_LOCAL_USER=abc npm run start:local`; the dev server then sends the headers of the edge for that user
     * (setupProxy.js), so the services check like in production. Without, the local user is an admin.
     */
    public static readonly LOCAL_USER = CONFIG.LOCAL_DEV ? (process.env.REACT_APP_LOCAL_USER || '').trim() : '';
}
