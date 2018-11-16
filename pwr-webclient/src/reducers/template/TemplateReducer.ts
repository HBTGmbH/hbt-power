import {TemplateStore} from '../../model/view/TemplateStore';
import {ActionType} from '../ActionType';
import {TemplateActions} from './TemplateActions';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';


export namespace TemplateReducer {

    import RemoveTemplateAction = TemplateActions.RemoveTemplateAction;
    import SetTemplateAction = TemplateActions.SetTemplateAction;
    import SetPreviewAction = TemplateActions.SetPreviewAction;

    export function reduce(store: TemplateStore, action: AbstractAction) {
        if (isNullOrUndefined(store)) {
            return TemplateStore.empty();
        }

        switch (action.type) {
            case ActionType.SetTemplate: {
                let act: SetTemplateAction = action as SetTemplateAction;
                let templates = store.templates();
                templates = templates.set(act.template.id, act.template);
                return store.templates(templates);
            }
            case ActionType.RemoveTemplate: {
                let act: RemoveTemplateAction = action as RemoveTemplateAction;
                let templates = store.templates();
                templates = templates.remove(act.id);
                return store.templates(templates);
            }
            case ActionType.ClearTemplates: {
                return store.templates(store.templates().clear());
            }
            case ActionType.TemplateRequestFailed: {
                console.error('TemplateRequestFailed');
                console.log('Template Store: ', store.templates());
                return store.templates();
            }
            case ActionType.SetPreview : {
                let act: SetPreviewAction = action as SetPreviewAction;
                return store.preview(act.url);
            }
        }
        return store;
    }
}