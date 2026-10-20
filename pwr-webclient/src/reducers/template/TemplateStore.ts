import * as Immutable from 'immutable';
import {Template} from '../../model/view/Template';

export interface TemplateStore {
    templates: Immutable.Map<string, Template>;
}

export function emptyTemplateStore(): TemplateStore {
    return {
        templates: Immutable.Map<string, Template>(),
    }
}
