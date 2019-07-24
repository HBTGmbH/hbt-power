import {AbstractAction} from '../../../profile/database-actions';
import {ActionType} from '../../../ActionType';

export interface ProjectDeleteAction extends AbstractAction {
    id: number;
}

export function projectDeleteAction(id: number) {
    return {
        type: ActionType.DeleteProjectSuccessful,
        id: id
    };
}