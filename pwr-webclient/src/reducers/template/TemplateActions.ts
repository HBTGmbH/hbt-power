import {AbstractAction} from '../profile/database-actions';
import {Template} from '../../model/view/Template';


export namespace TemplateActions {

    export interface SetTemplateAction extends AbstractAction {
        template: Template;
    }

    export interface RemoveTemplateAction extends AbstractAction {
        id: string;
    }

    export interface CreateTemplateAction extends AbstractAction {
        name: string,
        description: string,
        initials: string,
        path: string,
    }

    export interface ChangeTemplateAction extends AbstractAction {
        id: string,
        name: string,
        description: string,
        user: string,
    }

    export interface SetPreviewAction extends AbstractAction {
        templateId:string,
        filename:string,
        content:string,
        file:File,
    }
}