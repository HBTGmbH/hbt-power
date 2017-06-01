import {doop} from 'doop';
@doop
export class ViewElement {
    @doop
    public get enabled() {return doop<boolean, this>()};

    @doop
    public get elementId() {return doop<string, this>()};

    private constructor(enabled: boolean, elementId: string) {
        return this.enabled(enabled).elementId(elementId);
    }

    public static create(enabled: boolean, elementId: string) {
        return new ViewElement(enabled, elementId);
    }
}