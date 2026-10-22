import {ActionType} from '../ActionType';
import {AbstractAction} from '../BaseActions';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import Power from '@material-ui/icons/Power';

/**
 * Deleting in the admin area (#181): the dialog names the entry and what goes with it, and deleting only becomes
 * possible once the name was entered twice
 */
export interface NameConfirmation {
    header: string;
    msg: string;
    /** What has to be entered: the name of the entry, the initials of a consultant, the version… */
    name: string;
}

export interface DeferActionAction {
    type: ActionType.DeferAction;
    header: string;
    msg: string;
    actionOK: string;
    actionNOK: string;
    action: AbstractAction;
    /** Empty: a simple question */
    confirmName: string;
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
    const confirmByName: NameConfirmation = (action as any).confirmByName;
    return {
        action: action,
        header: confirmByName ? confirmByName.header : PowerLocalize.get('ConfirmDeleteEntry.Title'),
        msg: confirmByName ? confirmByName.msg : PowerLocalize.get('ConfirmDeleteEntry.Content'),
        actionNOK: PowerLocalize.get('ConfirmDeleteEntry.Action.CancelDelete'),
        actionOK: PowerLocalize.get('ConfirmDeleteEntry.Action.ConfirmDelete'),
        confirmName: confirmByName ? confirmByName.name : '',
        type: ActionType.DeferAction
    };
}

/**
 * Builds the confirmation of a delete in the admin area: header and message from the localization, the message
 * formatted with the name and further arguments
 */
export function confirmDeleteByName(key: string, name: string, ...args: any[]): NameConfirmation {
    return {
        header: PowerLocalize.get('ConfirmDeleteByName.' + key + '.Title'),
        msg: PowerLocalize.getFormatted('ConfirmDeleteByName.' + key + '.Content', name, ...args),
        name: name
    };
}

/** Leading and trailing spaces don't count, upper and lower case do (#181) */
export function matchesConfirmName(input: string, name: string): boolean {
    return !!name && input.trim() === name.trim();
}
