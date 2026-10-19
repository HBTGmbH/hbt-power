import {ThunkDispatch} from 'redux-thunk';
import {ActionType} from '../ActionType';
import {AbstractAction} from '../BaseActions';
import {ApplicationState} from '../reducerIndex';
import {storeHasUnsavedChanges} from '../../utils/PwrStoreUtils';
import {discardProjectChangesAction} from '../profile-new/profile/actions/ProjectActions';

interface PendingDecision {
    discard(): void;

    keep(): void;
}

// The callbacks of the open dialog; functions do not belong into the store
let pending: PendingDecision | null = null;

const openDialog = (): AbstractAction => ({type: ActionType.OpenUnsavedChangesDialog});
const closeDialog = (): AbstractAction => ({type: ActionType.CloseUnsavedChangesDialog});

/**
 * Runs onDiscard right away if no project has unsaved changes. Otherwise the UnsavedChangesDialog asks first:
 * "discard" drops the changes and then runs onDiscard, "keep editing" runs onKeep.
 */
export function confirmLeavingUnsavedChanges(onDiscard: () => void, onKeep: () => void = () => undefined) {
    return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
        if (!storeHasUnsavedChanges(getState())) {
            onDiscard();
            return;
        }
        if (pending) {
            // Only one question at a time: a new one cancels the open one
            pending.keep();
        }
        pending = {discard: onDiscard, keep: onKeep};
        dispatch(openDialog());
    };
}

export function discardUnsavedChanges() {
    return function (dispatch: ThunkDispatch<any, any, any>) {
        const decision = pending;
        pending = null;
        dispatch(closeDialog());
        // Before the action, so it does not run into the question again
        dispatch(discardProjectChangesAction());
        if (decision) {
            decision.discard();
        }
    };
}

export function keepUnsavedChanges() {
    return function (dispatch: ThunkDispatch<any, any, any>) {
        const decision = pending;
        pending = null;
        dispatch(closeDialog());
        if (decision) {
            decision.keep();
        }
    };
}
