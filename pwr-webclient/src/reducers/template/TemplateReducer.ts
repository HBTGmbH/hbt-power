import {emptyTemplateStore, TemplateStore} from './TemplateStore';
import {ActionType} from '../ActionType';
import {RemoveTemplateAction, SetTemplateAction} from './TemplateActions';
import {AbstractAction} from '../BaseActions';


export class TemplateReducer {

    public static reduce(store: TemplateStore = emptyTemplateStore(), action: AbstractAction): TemplateStore {
        switch (action.type) {
            case ActionType.SetTemplate: {
                let act: SetTemplateAction = action as SetTemplateAction;
                let templates = store.templates;
                templates = templates.set(act.template.id, act.template);
                return {
                    ...store,
                    templates
                }
            }
            case ActionType.RemoveTemplate: {
                let act: RemoveTemplateAction = action as RemoveTemplateAction;
                let templates = store.templates;
                templates = templates.remove(act.id);
                return {
                    ...store,
                    templates
                }
            }
            case ActionType.ClearTemplates: {
                return {
                    ...store,
                    templates: store.templates.clear()
                }
            }
            case ActionType.TemplateRequestFailed: {
                console.error('TemplateRequestFailed');
                return store;
            }
        }
        return store;
    }
}
