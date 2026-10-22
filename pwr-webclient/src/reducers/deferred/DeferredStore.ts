import {AbstractAction} from '../BaseActions';

export interface DeferredStore {
    deferredAction: AbstractAction;
    dialogHeader: string;
    dialogContent: string;
    dialogActionOK: string;
    dialogActionNOK: string;
    /** Has to be entered twice before deleting (#181); empty for a simple question */
    confirmName: string;
}

export const emptyDeferredStore: DeferredStore = {
    deferredAction: null,
    dialogHeader: '',
    dialogContent: '',
    dialogActionNOK: '',
    dialogActionOK: '',
    confirmName: ''
};
