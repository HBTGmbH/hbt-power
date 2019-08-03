import {AbstractAction} from '../../../profile/database-actions';
import {Project} from '../model/Project';
import {ActionType} from '../../../ActionType';

export interface ProjectUpdateAction extends AbstractAction {
    project: Project;
}

export interface ProjectLoadAction extends AbstractAction {
    projects: Array<Project>
}

export interface ProjectDeleteAction extends AbstractAction {
    id: number;
}

export interface SetEditingProjectAction extends AbstractAction {
    type: ActionType.SetEditingProject;
    project: Project;
}

export interface SelectProjectAction extends AbstractAction {
    type: ActionType.SelectProject;
    value: number;
}

export interface EditSelectedProjectAction extends AbstractAction {
    type: ActionType.EditSelectedProject;
}

export interface CancelEditSelectedProjectAction extends AbstractAction {
    type: ActionType.CancelEditSelectedProject;
}

export function projectUpdateSuccessAction(project: Project): ProjectUpdateAction {
    return {
        type: ActionType.UpdateProjectSuccessful,
        project: project
    };
}

export function projectDeleteAction(id: number) {
    return {
        type: ActionType.DeleteProjectSuccessful,
        id: id
    };
}

export function selectProject(index: number): SelectProjectAction {
    return {
        type: ActionType.SelectProject,
        value: index
    }
}

export function projectLoadAction(projects: Array<Project>): ProjectLoadAction {
    return {
        type: ActionType.LoadProjectsAction,
        projects: projects
    };
}

export function setEditingProjectAction(project: Project): SetEditingProjectAction {
    return {
        project: project,
        type:ActionType.SetEditingProject
    }
}

export function editSelectedProjectAction(): EditSelectedProjectAction {
    return  {
        type: ActionType.EditSelectedProject
    }
}

export function cancelEditSelectedProjectAction(): CancelEditSelectedProjectAction {
    return {
        type: ActionType.CancelEditSelectedProject
    }
}
