import {ProfileStore} from '../reducers/profile-new/ProfileStore';
import {areEqualArrays, areEqualByName, areEqualSkillsByName} from './PwrEqualUtils';
import {ApplicationState} from '../reducers/reducerIndex';

export function selectIndexHasChanged(state: ProfileStore, index: number) {
    return state.selectedProjectIndex !== index;
}

export function selectedProjectHasChanged(state: ProfileStore): boolean {
    const project = state.profile.projects[state.selectedProjectIndex];
    const editingProject = state.selectedProject;
    if (!editingProject || !project) {
        return false;
    }
    return project.id == null
        || project.name !== editingProject.name
        || project.startDate !== editingProject.startDate
        || project.endDate !== editingProject.endDate
        || project.description !== editingProject.description
        || !areEqualByName(project.client, editingProject.client)
        || !areEqualByName(project.broker, editingProject.broker)
        || !areEqualArrays(project.projectRoles, editingProject.projectRoles, areEqualByName)
        || !areEqualArrays(project.skills, editingProject.skills, areEqualSkillsByName);
}

export function storeHasUnsavedChanges(state: ApplicationState) {
    return selectedProjectHasChanged(state.profileStore);
}
