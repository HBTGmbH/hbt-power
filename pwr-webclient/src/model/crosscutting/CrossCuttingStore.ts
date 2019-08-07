import {doop} from 'doop';

@doop
export class CrossCuttingStore {
    @doop
    public get requestPending() {
        return doop<boolean, this>();
    }

    @doop
    public get isBlocking() {
        return doop<boolean, this>();
    }

    @doop
    public get isUnsavedChangesOpen() {
        return doop<boolean, this>();
    }

    private constructor(requestPending: boolean, isBlocking: boolean, isUnsavedChangesOpen: boolean) {
        return this.requestPending(requestPending)
            .isBlocking(isBlocking)
            .isUnsavedChangesOpen(isUnsavedChangesOpen);
    }

    public static empty(): CrossCuttingStore {
        return new CrossCuttingStore(false, false, false);
    }

}
