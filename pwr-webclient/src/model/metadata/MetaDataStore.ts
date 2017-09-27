import {doop} from 'doop';
import {BuildInfo} from './BuildInfo';
import * as Immutable from 'immutable';
import {ClientBuildInfo} from './ClientBuildInfo';

/**
 * Created by nt on 21.08.2017.
 */

@doop
export class MetaDataStore {
    public static KEY_PROFILE: string = "pwr-profile-service";
    public static KEY_SKILL: string = "pwr-skill-service";
    public static KEY_REPORT: string = "pwr-report-service";
    public static KEY_STATISTICS: string = "pwr-statistics-service";
    public static KEY_VIEW_PROFIE: string = "pwr-view-profile-service";

    @doop public get buildInfoByService() { return doop<Immutable.Map<string, BuildInfo>, this>()};

    @doop public get clientBuildInfo() {return doop<ClientBuildInfo, this>()};

    private constructor(buildInfoByService: Immutable.Map<string, BuildInfo>, clientBuildInfo: ClientBuildInfo) {
        return this.buildInfoByService(buildInfoByService).clientBuildInfo(clientBuildInfo);
    }

    public static empty() {
        return new MetaDataStore(Immutable.Map<string, BuildInfo>(), null);
    }
}