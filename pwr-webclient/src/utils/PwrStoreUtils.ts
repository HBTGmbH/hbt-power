import {ProfileStore} from '../reducers/profile-new/ProfileStore';
import {areEqualArrays, areEqualByName} from './PwrEqualUtils';
import {Project} from '../reducers/profile-new/profile/model/Project';
import {nameEntityName} from './NullSafeUtils';
import {ApplicationState} from '../reducers/reducerIndex';

export function selectIndexHasChanged(state: ProfileStore, index: number) {
    return state.selectedProjectIndex !== index;
}

/**
 * Unsaved changes exist only in edit mode: a new project with any input, or an existing project that differs from
 * its saved version (found by id, not by its position in the list).
 */
export function selectedProjectHasChanged(state: ProfileStore): boolean {
    const editingProject = state.selectedProject;
    if (!state.isProjectEditing || !editingProject) {
        return false;
    }
    if (editingProject.id == null) {
        return newProjectHasInput(editingProject);
    }
    const project = state.profile.projects.find(saved => saved.id === editingProject.id);
    if (!project) {
        return false;
    }
    return project.name !== editingProject.name
        || project.startDate !== editingProject.startDate
        || project.endDate !== editingProject.endDate
        || project.description !== editingProject.description
        || !areEqualByName(project.client, editingProject.client)
        || !areEqualByName(project.broker, editingProject.broker)
        || !haveSameNames(project.projectRoles, editingProject.projectRoles)
        || !haveSameNames(project.skills, editingProject.skills);
}

function newProjectHasInput(project: Project): boolean {
    return !!project.name
        || !!project.description
        || !!nameEntityName(project.client)
        || !!nameEntityName(project.broker)
        || (project.projectRoles || []).length > 0
        || (project.skills || []).length > 0;
}

/**
 * Compares by name, independent of the order
 */
function haveSameNames(a: Array<{ name: string }>, b: Array<{ name: string }>): boolean {
    const names = (list: Array<{ name: string }>) => (list || []).map(entry => entry.name).sort();
    return areEqualArrays(names(a), names(b));
}

export function storeHasUnsavedChanges(state: ApplicationState) {
    return selectedProjectHasChanged(state.profileStore);
}
