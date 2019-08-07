import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';

export interface DeferActionAction {
    type: ActionType.DeferAction;
    action: AbstractAction;
}

export interface ConfirmDeferredActionAction {
    type: ActionType.ConfirmDeferredAction;
}

export interface RejectDeferredActionAction {
    type: ActionType.RejectDeferredAction;
}

export function rejectDeferredAction(): RejectDeferredActionAction {
    return {
        type: ActionType.RejectDeferredAction
    }
}

export function confirmDeferredAction(): ConfirmDeferredActionAction {
    return {
        type: ActionType.ConfirmDeferredAction
    }
}

export function deferAction(action: AbstractAction): DeferActionAction {
    return {
        action: action,
        type: ActionType.DeferAction
    }
}
