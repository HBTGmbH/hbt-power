import {Project} from '../model/Project';
import {AbstractAction} from '../../../profile/database-actions';
import {ActionType} from '../../../ActionType';

export interface ProjectUpdateAction extends AbstractAction {
    project: Project;
}

export function projectUpdateAction(project: Project) {
    return {
        type: ActionType.UpdateProjectSuccessful,
        project: project
    };
}