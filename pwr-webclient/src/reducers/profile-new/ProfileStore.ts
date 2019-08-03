import {Profile} from './profile/model/Profile';
import {Consultant} from './consultant/model/Consultant';
import {Project} from './profile/model/Project';

export interface ProfileStore {
    profile: Profile;
    consultant: Consultant;
    selectedProjectIndex: number;
    editedProject: Project; // TODO rename to selected
    isProjectEditing: boolean;
}

export const emptyStore: ProfileStore = {
    profile: null,
    consultant: null,
    editedProject: null,
    selectedProjectIndex: -1,
    isProjectEditing: false
};

