import * as Immutable from 'immutable';
import {ViewProfile} from './ViewProfile';
import {ViewCategory} from './ViewCategory';

export interface ViewProfileStore {
    viewProfiles: Immutable.Map<string, ViewProfile>;
    sortInProgress: boolean;
    parentsForSkill: Immutable.Map<number, ViewCategory>;
}

export function emptyViewProfileStore(): ViewProfileStore {
    return {
        viewProfiles: Immutable.Map<string, ViewProfile>(),
        parentsForSkill: Immutable.Map<number, ViewCategory>(),
        sortInProgress: false,
    }
}
