import {doop} from 'doop';
import {BuildInfo} from './BuildInfo';
import * as Immutable from 'immutable';
/**
 * Created by nt on 21.08.2017.
 */

@doop
export class MetaDataStore {
    public static KEY_PROFILE: string = "pwr-profile-service";
    public static KEY_SKILL: string = "pwr-skill-service";
    public static KEY_REPORT: string = "pwr-report-service";
    public static KEY_STATISTICS: string = "pwr-statistics-service";

    @doop public get buildInfoByService() { return doop<Immutable.Map<string, BuildInfo>, this>()};

    private constructor(buildInfoByService: Immutable.Map<string, BuildInfo>) {
        return this.buildInfoByService(buildInfoByService);
    }

    public static empty() {
        return new MetaDataStore(Immutable.Map<string, BuildInfo>());
    }
}