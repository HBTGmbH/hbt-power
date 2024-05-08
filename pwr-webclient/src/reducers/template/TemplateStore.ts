import * as Immutable from 'immutable';
import {Template} from '../../model/view/Template';
import {ReportPreviewFile} from '../../model/view/ReportPreviewFile';

export interface TemplateStore {
    templates: Immutable.Map<string, Template>;
    previews: Immutable.Map<string, ReportPreviewFile>;
}

export function emptyTemplateStore(): TemplateStore {
    return {
        previews: Immutable.Map<string, ReportPreviewFile>(),
        templates: Immutable.Map<string, Template>(),
    }
}
