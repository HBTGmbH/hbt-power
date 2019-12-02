import {Template, TemplateSlice} from '../../model/view/Template';
import {AbstractAction} from '../BaseActions';
import {ActionType} from '../ActionType';


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


    /**
     * speichert ein template - local
     * @param {Template} template
     * @returns {TemplateActions.SetTemplateAction}
     * @constructor
     */
    export function SetTemplate(template: Template): SetTemplateAction {
        return {
            type: ActionType.SetTemplate,
            template: template,
        };
    }

    /**
     * entfernt ein template - local
     * @param {string} id
     * @returns {TemplateActions.RemoveTemplateAction}
     * @constructor
     */
    export function RemoveTemplate(id: string): RemoveTemplateAction {
        return {
            type: ActionType.SetTemplate,
            id: id
        };
    }

    export function ClearTemplates(): AbstractAction {
        return {
            type: ActionType.ClearTemplates,
        };
    }

    export function CreateTemplate(name: string, description: string, initials: string, path: string): CreateTemplateAction {
        return {
            type: ActionType.CreateTemplate,
            name: name,
            description: description,
            initials: initials,
            path: path,
        };
    }

    export function ChangeTemplate(template: TemplateSlice): ChangeTemplateAction {
        return {
            type: ActionType.ChangeTemplate,
            id: template.id,
            name: template.name,
            description: template.description,
            user: template.user,
        };
    }

    export function TemplateRequestFailed(): AbstractAction {
        return {
            type: ActionType.TemplateRequestFailed,
        };
    }


    export function SetPreview(templateId: string, filename: string, content: string, file: File): SetPreviewAction {
        return {
            type: ActionType.SetPreview,
            templateId: templateId,
            filename: filename,
            content: content,
            file: file,
        };

    }
}
