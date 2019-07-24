import {Profile} from './profile/model/Profile';
import {Consultant} from './consultant/model/Consultant';

export interface ProfileStore {
    profile: Profile;
    consultant: Consultant;
}

export const emptyStore: ProfileStore = {
    profile: null,
    consultant: null
};

