import {AbstractAction} from '../../profile/database-actions';
import {NameEntity} from '../../profile-new/profile/model/NameEntity';
import {SuggestionField} from '../model/SuggestionField';
import {ActionType} from '../../ActionType';

export interface SuggestionUpdateAction extends AbstractAction {
    field: SuggestionField,
    payload: Array<NameEntity>;
}

export function suggestionUpdateAction(field: SuggestionField, payload: Array<NameEntity>): SuggestionUpdateAction {
    return {
        type: ActionType.UpdateSuggestionField,
        field: field,
        payload: payload
    };
}