import {AbstractAction} from '../../../profile/database-actions';
import {ActionType} from '../../../ActionType';

export function resetProfileStore(): AbstractAction {
    return {
        type: ActionType.ResetProfileStore
    }
}
