import {AbstractAction} from '../../../profile/database-actions';
import {ActionType} from '../../../ActionType';

export interface SkillDeleteAction extends AbstractAction {
    id: number;
}

export function skillDeleteAction(id: number) {
    return {
        type: ActionType.DeleteProfileSkillSuccessful,
        id: id
    };
}