import {NameEntity} from '../../profile-new/profile/model/NameEntity';
import {NameEntityAlias} from '../../../model/NameEntityAlias';
import {SuggestionField} from '../model/SuggestionField';
import {ActionType} from '../../ActionType';
import {AbstractAction} from '../../BaseActions';

export interface SuggestionUpdateAction extends AbstractAction {
    field: SuggestionField,
    payload: Array<NameEntity> | Array<NameEntityAlias>;
}

export function suggestionUpdateAction(field: SuggestionField, payload: Array<NameEntity> | Array<NameEntityAlias>): SuggestionUpdateAction {
    return {
        type: ActionType.UpdateSuggestionField,
        field: field,
        payload: payload
    };
}
