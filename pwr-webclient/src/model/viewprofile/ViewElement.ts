import {doop} from 'doop';
@doop
export class ViewElement {
    @doop
    public get enabled() {return doop<boolean, this>()};

    @doop
    public get elementId() {return doop<string, this>()};

    private constructor(enabled: boolean) {
        return this.enabled(enabled);
    }

    public static create(enabled: boolean) {
        return new ViewElement(enabled);
    }
}