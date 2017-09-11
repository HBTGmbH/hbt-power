import {doop} from 'doop';
import * as Immutable from 'immutable';
import {ViewProfile} from './ViewProfile';

@doop
export class ViewProfileStore {
    @doop public get viewProfiles() { return doop<Immutable.List<ViewProfile>, this>()};

    private constructor() {
        return this;
    }

    public static empty(): ViewProfileStore {
        return new ViewProfileStore().viewProfiles(Immutable.List<ViewProfile>());
    }
}