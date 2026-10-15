import {AbstractAction} from '../BaseActions';

export interface DeferredStore {
    deferredAction: AbstractAction;
    dialogHeader: string;
    dialogContent: string;
    dialogActionOK: string;
    dialogActionNOK: string;
}

export const emptyDeferredStore: DeferredStore = {
    deferredAction: null,
    dialogHeader: '',
    dialogContent: '',
    dialogActionNOK: '',
    dialogActionOK: ''
};
