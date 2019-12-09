import {doop} from 'doop';
import * as Immutable from 'immutable';
import {ViewProfile} from './ViewProfile';
import {ViewCategory} from './ViewCategory';

@doop
export class ViewProfileStore {
    @doop
    public get viewProfiles() {
        return doop<Immutable.Map<string, ViewProfile>, this>();
    };

    @doop
    public get sortInProgress() {
        return doop<boolean, this>();
    };

    @doop
    public get parentsForSkill() {
        return doop<Immutable.Map<number, ViewCategory>, this>();
    }

    private constructor() {
        return this;
    }

    public static empty(): ViewProfileStore {
        return new ViewProfileStore()
            .viewProfiles(Immutable.Map<string, ViewProfile>())
            .sortInProgress(false)
            .parentsForSkill(Immutable.Map<number, ViewCategory>());
    }
}