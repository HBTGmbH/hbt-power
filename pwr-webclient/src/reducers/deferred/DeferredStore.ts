import {AbstractAction} from '../profile/database-actions';

export interface DeferredStore {
    deferredAction: AbstractAction;
}

export const emptyDeferredStore: DeferredStore = {
    deferredAction: null
};
