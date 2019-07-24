import {emptyStore, SuggestionStore} from './SuggestionStore';
import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {SuggestionUpdateAction} from './actions/SuggestionUpdateAction';
import {SkillSuggestionUpdateAction} from './actions/SkillSuggestionUpdateAction';

export function reduceSuggestion(store: SuggestionStore = emptyStore, action: AbstractAction): SuggestionStore {
    switch (action.type) {
        case ActionType.UpdateSuggestionField: {
            return handleUpdateField(action as SuggestionUpdateAction, store);
        }
        case ActionType.UpdateSkillSuggestionField: {
            return handleUpdateSkills(action as SkillSuggestionUpdateAction,store);
        }
    }

    return store;
}

function handleUpdateField(action: SuggestionUpdateAction, store: SuggestionStore): SuggestionStore {
    return {...store, [action.field]: action.payload};
}

function handleUpdateSkills(action: SkillSuggestionUpdateAction, store:SuggestionStore):SuggestionStore {
    return {...store, allSkills: action.payload}
}