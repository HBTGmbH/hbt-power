import {doop} from 'doop';
import * as Immutable from 'immutable';
import {Template} from './Template';
import {ReportPreviewFile} from './ReportPreviewFile';


@doop
export class TemplateStore {
    @doop
    public get templates() {
        return doop<Immutable.Map<string, Template>, this>();
    };

    @doop
    public get previews() {
        return doop<Immutable.Map<string, ReportPreviewFile>, this>();
    };

    @doop
    public get preview() {
        return doop<string, this>();
    };


    private constructor() {
        return this;
    }

    public static empty(): TemplateStore {
        return new TemplateStore().templates(Immutable.Map<string, Template>());
    }
}