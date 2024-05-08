import {BuildInfo} from './BuildInfo';
import * as Immutable from 'immutable';
import {ClientBuildInfo} from './ClientBuildInfo';

/**
 * Created by nt on 21.08.2017.
 */

export interface MetaDataStore {
    buildInfoByService: Immutable.Map<string, BuildInfo>;
    clientBuildInfo: ClientBuildInfo | null;
}

export function emptyMetaDataStore(): MetaDataStore {
    return {
        buildInfoByService: Immutable.Map<string, BuildInfo>(),
        clientBuildInfo: null,
    }
}

export const MetaDataStoreKeys = {
   KEY_PROFILE: 'pwr-profile-service',
   KEY_SKILL: 'pwr-skill-service',
   KEY_REPORT: 'pwr-report-service',
   KEY_STATISTICS: 'pwr-statistics-service',
   KEY_VIEW_PROFILE: 'pwr-view-profile-service',
}
