import {AbstractAction} from '../BaseActions';

export interface DeferredStore {
    deferredAction: AbstractAction;
}

export const emptyDeferredStore: DeferredStore = {
    deferredAction: null
};
