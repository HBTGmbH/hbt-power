import {ActionType} from '../../ActionType';
import {AbstractAction} from '../../BaseActions';

export interface SkillSuggestionUpdateAction extends AbstractAction {
    payload: Array<string>;
}

export function skillSuggestionUpdateAction(payload: Array<string>): SkillSuggestionUpdateAction {
    return {
        type: ActionType.UpdateSkillSuggestionField,
        payload: payload
    };
}
