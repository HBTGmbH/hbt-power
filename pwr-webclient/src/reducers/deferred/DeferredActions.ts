import {ActionType} from '../ActionType';
import {AbstractAction} from '../BaseActions';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import Power from '@material-ui/icons/Power';

export interface DeferActionAction {
    type: ActionType.DeferAction;
    header: string;
    msg: string;
    actionOK: string;
    actionNOK: string;
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
    };
}

export function confirmDeferredAction(): ConfirmDeferredActionAction {
    return {
        type: ActionType.ConfirmDeferredAction
    };
}

export function deferDeleteEntry(action: AbstractAction): DeferActionAction {
    return {
        action: action,
        header: PowerLocalize.get('ConfirmDeleteEntry.Title'),
        msg: PowerLocalize.get('ConfirmDeleteEntry.Content'),
        actionNOK: PowerLocalize.get('ConfirmDeleteEntry.Action.CancelDelete'),
        actionOK: PowerLocalize.get('ConfirmDeleteEntry.Action.ConfirmDelete'),
        type: ActionType.DeferAction
    };
}
