import {ViewProfileStore} from '../../model/view/ViewProfileStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
export namespace ViewProfileReducer {
    export function reduce(store: ViewProfileStore, action: AbstractAction) {
        console.debug("ViewProfileReducer called with action type " + ActionType[action.type]);
        if(isNullOrUndefined(store)) {
            return ViewProfileStore.empty();
        }
        return store;
    }
}