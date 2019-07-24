import {AbstractAction} from '../../../profile/database-actions';
import {Project} from '../model/Project';
import {ActionType} from '../../../ActionType';

export interface ProjectLoadAction extends AbstractAction {
    projects: Array<Project>
}

export function projectLoadAction(projects: Array<Project>): ProjectLoadAction {
    return {
        type: ActionType.LoadProjectsAction,
        projects: projects
    };
}