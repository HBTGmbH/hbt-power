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


    private constructor(requestPending: boolean, isBlocking: boolean) {
        return this.requestPending(requestPending).isBlocking(isBlocking);
    }

    public static empty(): CrossCuttingStore {
        return new CrossCuttingStore(false, false);
    }

}