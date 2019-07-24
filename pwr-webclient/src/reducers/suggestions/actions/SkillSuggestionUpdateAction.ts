import {AbstractAction} from '../../profile/database-actions';
import {ActionType} from '../../ActionType';

export interface SkillSuggestionUpdateAction extends AbstractAction {
    payload: Array<String>;
}

export function skillSuggestionUpdateAction(payload: Array<String>): SkillSuggestionUpdateAction {
    return {
        type: ActionType.UpdateSkillSuggestionField,
        payload: payload
    };
}