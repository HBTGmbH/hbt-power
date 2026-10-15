declare const POWER_APP_PATH: string;
declare const POWER_LOCALE_PATH: string;
declare const POWER_AZURE_TENANT_ID: string;
declare const POWER_AZURE_CLIENT_ID: string;

export class CONFIG {
    public static readonly APP_PATH: string = POWER_APP_PATH;
    public static readonly LOCALE_PATH = POWER_LOCALE_PATH;
    public static readonly AZURE_TENANT_ID = POWER_AZURE_TENANT_ID;
    public static readonly AZURE_CLIENT_ID = POWER_AZURE_CLIENT_ID;
    /**
     * Set by `npm run start:local`: talk to the local services without the edge service and skip Azure authentication.
     * Inlined at build time, so a production build can never enable it.
     */
    public static readonly LOCAL_DEV = process.env.REACT_APP_LOCAL_DEV === 'true';
}
