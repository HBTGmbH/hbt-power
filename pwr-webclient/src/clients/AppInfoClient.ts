import {PowerHttpClient} from './PowerHttpClient';
import {ActuatorInfo, ClientInfo, ComponentInfo, ofActuatorInfo, ofClientInfo, unavailable} from '../model/metadata/ComponentInfo';

declare const POWER_PROFILE_SERVICE_URL: string;
declare const POWER_SKILL_SERVICE_URL: string;
declare const POWER_VIEW_PROFILE_SERVICE_URL: string;
declare const POWER_REPORT_SERVICE_URL: string;
declare const POWER_STATISTICS_SERVICE_URL: string;
declare const CLIENT_BUILD_INFO_LOCATION: string;

/**
 * The edge has no URL of its own in config.js. It publishes its info under the same prefix as the services it routes
 * to (/api/pwr-edge-service), see management.endpoints.web.base-path in pwr-edge-service.
 */
function edgeServiceUrl(): string {
    return POWER_PROFILE_SERVICE_URL.replace(/pwr-profile-service\/?$/, 'pwr-edge-service');
}

/**
 * Version and commit of every component, for the app info. A component that cannot be reached is reported as
 * unavailable: no loading spinner, no error alert.
 */
export class AppInfoClient extends PowerHttpClient {

    private static _instance: AppInfoClient;

    public static instance(): AppInfoClient {
        if (!this._instance) {
            this._instance = new AppInfoClient();
        }
        return this._instance;
    }

    private serviceInfo(name: string, baseUrl: string): Promise<ComponentInfo> {
        return this.getQuietly<ActuatorInfo>(baseUrl + '/actuator/info')
            .then(info => ofActuatorInfo(name, info))
            .catch(() => unavailable(name));
    }

    private clientInfo(name: string): Promise<ComponentInfo> {
        return this.getQuietly<ClientInfo>(CLIENT_BUILD_INFO_LOCATION)
            .then(info => ofClientInfo(name, info))
            .catch(() => unavailable(name));
    }

    /**
     * The commit of the webclient the server delivers now (#247); null if it cannot be loaded, e.g. while the
     * container is replaced (502): quietly, no spinner, no alert
     */
    public getDeliveredCommit(): Promise<string | null> {
        return this.getQuietly<ClientInfo>(CLIENT_BUILD_INFO_LOCATION)
            .then(info => (info && info.commit) || null)
            .catch(() => null);
    }

    public getComponentInfos(): Promise<Array<ComponentInfo>> {
        return Promise.all([
            this.clientInfo('Webclient'),
            this.serviceInfo('Edge', edgeServiceUrl()),
            this.serviceInfo('Profile', POWER_PROFILE_SERVICE_URL),
            this.serviceInfo('Skill', POWER_SKILL_SERVICE_URL),
            this.serviceInfo('View-Profile', POWER_VIEW_PROFILE_SERVICE_URL),
            this.serviceInfo('Report', POWER_REPORT_SERVICE_URL),
            this.serviceInfo('Statistics', POWER_STATISTICS_SERVICE_URL),
        ]);
    }
}
