import {Profile} from './model/Profile';

export interface ProfileStore {
    profile: Profile;
}

export const emptyStore: ProfileStore = {
    profile: null
};

