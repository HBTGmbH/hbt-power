import {ActionType} from '../ActionType';
import {TemplateActions} from './TemplateActions';
import {Template, TemplateSlice} from '../../model/view/Template';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {CrossCuttingActionCreator} from '../crosscutting/CrossCuttingActionCreator';
import {AdminActionCreator} from '../admin/AdminActionCreator';
import {Alerts} from '../../utils/Alerts';
import {AbstractAction} from '../BaseActions';
import {TemplateClient} from '../../clients/TemplateClient';
import {makeDeferrable} from '../deferred/AsyncActionUnWrapper';

const templateClient = TemplateClient.instance();

export namespace TemplateActionCreator {
    import SetTemplateAction = TemplateActions.SetTemplateAction;
    import RemoveTemplateAction = TemplateActions.RemoveTemplateAction;
    import CreateTemplateAction = TemplateActions.CreateTemplateAction;
    import ChangeTemplateAction = TemplateActions.ChangeTemplateAction;
    import SetPreviewAction = TemplateActions.SetPreviewAction;

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

    /*  TEMPLATES  by mp*/

    /**
     * Fuegt ein vom view-service empfangenes Template dem TemplateState hinzu
     *
     * @param templateResponse
     * @param {Dispatch<ApplicationState>} dispatch
     * @constructor
     */
    function TemplateReceived(templateResponse: Template, dispatch: redux.Dispatch<ApplicationState>) {
        let template: Template = new Template(templateResponse);
        dispatch(SetTemplate(template));
    }

    function PreviewReceived(id: string, response: AxiosResponse, dispatch: redux.Dispatch<ApplicationState>) {
        dispatch(SetPreview(id, 'hardcoded filename', 'hardcoded content', response.data));
    }

    function DownloadFile(response: AxiosResponse) {
        console.log('File received');
        let blob: Blob = new Blob([response.data], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
        let a: any = document.createElement('a');
        a.style = 'display: none';
        document.body.appendChild(a);
        //Create a DOMString representing the blob
        //and point the link element towards it
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'exportFile.docx';
        //programatically click the link to trigger the download
        a.click();
        //release the reference to the file by revoking the Object URL
        window.URL.revokeObjectURL(url);
    }

    export function AsyncChangeTemplate(template: Template) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            templateClient.changeTemplate(template.id, template)
                .then((response) => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))

                .catch(() => dispatch(TemplateActionCreator.TemplateRequestFailed()))
                .catch((error: AxiosError) => console.error(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteTemplate)
    export function AsyncDeleteTemplate(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            templateClient.deleteTemplate(id)
                .then(() => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))

                .catch(() => dispatch(TemplateActionCreator.TemplateRequestFailed()))
                .catch((error: AxiosError) => console.error(error));
        };
    }

    export function DownloadReportFile(location: string) {
        console.log('File received');
        let blob: Blob = new Blob([''], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
        let a: any = document.createElement('a');
        a.style = 'display: none';
        document.body.appendChild(a);
        //Create a DOMString representing the blob
        //and point the link element towards it
        let url = window.URL.createObjectURL(blob);
        a.href = location;

        let name: string = location.split('/')[location.split('/').length - 1];
        console.log(name);
        name = name.split('.')[0];
        a.download = name;
        //programatically click the link to trigger the download
        a.click();
        //release the reference to the file by revoking the Object URL
        window.URL.revokeObjectURL(url);
    }

    export function AsyncDownloadFile(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            templateClient.getFileById(id)
                .then((response: AxiosResponse) => DownloadFile(response))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error: AxiosError) => console.error('AsyncDownloadFile', error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }


    function AsyncLoadTemplate(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            templateClient.getTemplateById(id)
                .then((template) => TemplateReceived(template, dispatch))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error: AxiosError) => console.error('AsyncLoadTemplate', error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));


        };
    }

    export function AsyncLoadAllTemplates() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(ClearTemplates());
            templateClient.getAllTemplates()
                .then((response) => response.forEach(id => dispatch(AsyncLoadTemplate(id))))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }


    export function AsyncLoadPreview(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            if (id != '') {
                dispatch(CrossCuttingActionCreator.startRequest());
                templateClient.getPreview(id)
                    .then((response: AxiosResponse) => PreviewReceived(id, response.data, dispatch))
                    .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                    .catch((error) => console.error(error))
                    .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
            }
        };
    }


    export function AsyncLoadAllPreviews() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            templateClient.getAllPreviews()
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }

    export function AsyncLoadAllFiles() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            templateClient.getAllFiles()
                .then((response) => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }

    export function AsyncUploadFileAsTemplate(file: any, name: string, description: string, createUser: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('templateSlice', JSON.stringify({
                name: name,
                description: description,
                createUser: createUser
            }));
            const config: AxiosRequestConfig = {
                headers: {'content-type': 'multipart/form-data'},
                onUploadProgress: (event) => {
                    const percentProgress = (event.loaded * 100) / event.total;
                    dispatch(AdminActionCreator.SetReportUploadProgress(percentProgress));
                }
            };
            dispatch(AdminActionCreator.SetReportUploadPending(true));
            templateClient.uploadAsTemplate(formData, config)
                .then(() => dispatch(AdminActionCreator.SetReportUploadPending(false)))
                .then(() => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))
                .then(() => Alerts.showSuccess('Template erfolgreich hochgeladen!'))
                .then(() => dispatch(AdminActionCreator.SetReportUploadProgress(0)))

                .catch((error) => Alerts.showError('Upload Fehlgeschlagen: ' + error.toString()))
                .catch((error) => dispatch(AdminActionCreator.SetReportUploadPending(false)))
                .catch((error) => dispatch(AdminActionCreator.SetReportUploadProgress(0)));
        };
    }
}
