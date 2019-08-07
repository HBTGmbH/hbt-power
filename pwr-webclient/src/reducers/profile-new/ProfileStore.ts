import {emptyProfile, Profile} from './profile/model/Profile';
import {Consultant} from './consultant/model/Consultant';
import {Project} from './profile/model/Project';

export interface ProfileStore {
    profile: Profile;
    consultant: Consultant;
    selectedProjectIndex: number;
    selectedProject: Project;
    isProjectEditing: boolean;
}

export const emptyStore: ProfileStore = {
    profile: emptyProfile(),
    consultant: null,
    selectedProject: null,
    selectedProjectIndex: -1,
    isProjectEditing: false
};

