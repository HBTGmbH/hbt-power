import {AbstractAction} from '../profile/database-actions';
import {Template} from '../../model/view/Template';


export namespace TemplateActions {

    export interface SetTemplateAction extends AbstractAction{
        template: Template;
    }

    export interface RemoveTemplateAction extends AbstractAction{
        id: string;
    }

    export interface CreateTemplateAction extends AbstractAction{
        name: string,
        description: string,
    }

    export interface ChangeTemplateAction extends AbstractAction{
        name: string,
        description: string,
    }
}