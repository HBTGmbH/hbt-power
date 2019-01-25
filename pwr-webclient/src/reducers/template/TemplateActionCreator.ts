import {ActionType} from '../ActionType';
import {TemplateActions} from './TemplateActions';
import {Template, TemplateSlice} from '../../model/view/Template';
import {AbstractAction} from '../profile/database-actions';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {ReportService, TemplateService} from '../../API_CONFIG';
import {CrossCuttingActionCreator} from '../crosscutting/CrossCuttingActionCreator';

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

    /**
     * loescht die gespeicherten templates - local
     * @returns {AbstractAction}
     * @constructor
     */
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
            path: template.path,
        };
    }

    export function TemplateRequestFailed(): AbstractAction {
        return {
            type: ActionType.TemplateRequestFailed,
        };
    }


    export function SetPreview(tempalteId: string, filename: string, content: string, file: File): SetPreviewAction {
        return {
            type: ActionType.SetPreview,
            templateId: tempalteId,
            filename: filename,
            content: content,
            file: file,
        };

    }

    /*  TEMPLATES  by mp*/

    /**
     * Fuegt ein vom view-service empfangenes Template dem TemplateState hinzu
     *
     * @param {AxiosResponse} response : die Response des view-service
     * @param {Dispatch<ApplicationState>} dispatch
     * @constructor
     */
    function TemplateReceived(response: AxiosResponse, dispatch: redux.Dispatch<ApplicationState>) {
        let template: Template = new Template(response.data);
        dispatch(SetTemplate(template));
    }

    function PreviewReceived(id: string, response: AxiosResponse, dispatch: redux.Dispatch<ApplicationState>) {
        console.log('Preview Received ', response);
        dispatch(SetPreview(id, 'hardcoded filename', 'hardcoded content', response.data));
    }

    function DownloadFile(response:AxiosResponse){
        console.log("File received");
        let blob:Blob = new Blob(response.data,{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
        let a:any = document.createElement("a");
        a.style = "display: none";
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

    function AsyncChangeTemplate(templateSlice: TemplateSlice) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            axios.patch(TemplateService.ChangeTemplate(templateSlice.id), {
                name: templateSlice.name,
                description: templateSlice.description,
                path: templateSlice.path,
            })
                .then((response: AxiosResponse) => {
                    TemplateReceived(response, dispatch);
                })
                .catch((error: AxiosError) => {
                    dispatch(TemplateActionCreator.TemplateRequestFailed());
                    console.error(error);
                });
        };
    }

    /*
        export function AsyncCreateTemplate(name: string, description: string, initials: string, path: string) {
            return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                dispatch(CrossCuttingActionCreator.startRequest());
                axios.post(TemplateService.CreateTemplate(), {
                    description: description,
                    path: path,
                    createUser: initials,
                })
                    .then((response: AxiosResponse) => {
                        TemplateReceived(response, dispatch);
                        dispatch(CrossCuttingActionCreator.endRequest());
                    })
                    .catch((error: AxiosError) => {
                        dispatch(CrossCuttingActionCreator.endRequest());
                        dispatch(TemplateActionCreator.TemplateRequestFailed());
                        console.error(error);
                    });
            };
        }
    */


    export function AsyncDownloadFile(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            axios.get(ReportService.getFileById(id)).then((response: AxiosResponse) => {
                DownloadFile(response);
                dispatch(CrossCuttingActionCreator.endRequest());
            }).catch((error: AxiosError) => {
                dispatch(CrossCuttingActionCreator.endRequest());
                console.error('AsyncDownloadFile', error);
            });
        };
    }


    function AsyncLoadTemplate(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            axios.get(TemplateService.getTemplateById(id)).then((response: AxiosResponse) => {
                //console.log('AsyncLoadTemplate resonse:', response.data);
                TemplateReceived(response, dispatch);
                dispatch(CrossCuttingActionCreator.endRequest());
            }).catch((error: AxiosError) => {
                dispatch(CrossCuttingActionCreator.endRequest());
                console.error('AsyncLoadTemplate', error);
            });
        };
    }

    export function AsyncLoadAllTemplates() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(ClearTemplates());
            axios.get(TemplateService.getAllTemplates()).then((response: AxiosResponse) => {
                let ids: Array<string> = response.data;
                ids.forEach(id => dispatch(AsyncLoadTemplate(id)));
                dispatch(CrossCuttingActionCreator.endRequest());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(CrossCuttingActionCreator.endRequest());
            });
        };
    }


    export function AsyncLoadPreview(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            if (id != '') {
                dispatch(CrossCuttingActionCreator.startRequest());
                axios.get(TemplateService.getPreview(id), {})// url address
                    .then((response: AxiosResponse) => {
                        console.log(response);
                        PreviewReceived(id, response.data, dispatch);      // in den state laden
                        dispatch(CrossCuttingActionCreator.endRequest());
                    })
                    .catch(function (error: any) {
                        console.error(error);
                        dispatch(CrossCuttingActionCreator.endRequest());
                    });
            }
        };
    }


    export function AsyncLoadPreviewFromReport(filename: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            if (filename != '') {
                // dispatch(CrossCuttingActionCreator.startRequest());
                axios.get(TemplateService.getPreviewFromReport(filename))// url address
                    .then((response: AxiosResponse) => {
                        console.log(response);
                        PreviewReceived(filename, response.data, dispatch);      // in den state laden
                        //       dispatch(CrossCuttingActionCreator.endRequest());
                    })
                    .catch(function (error: any) {
                        console.error(error);
                        //     dispatch(CrossCuttingActionCreator.endRequest());
                    });
            }
        };
    }

    export function AsyncLoadAllPreviews() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            axios.get(TemplateService.getAllPreviews())
                .then((response: AxiosResponse) => {
                        console.log('All Preview Files', response.data);
                        dispatch(CrossCuttingActionCreator.endRequest());
                    }
                )
                .catch(function (error: any) {
                    console.error(error);
                    dispatch(CrossCuttingActionCreator.endRequest());
                });
        };
    }

    export function AsyncLoadAllFiles() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            axios.get(TemplateService.getAllFiles())
                .then((response: AxiosResponse) => {
                    console.log('All Files ', response.data);
                    dispatch(CrossCuttingActionCreator.endRequest());
                })
                .catch(function (error: any) {
                    console.error(error);
                    dispatch(CrossCuttingActionCreator.endRequest());
                });
        };
    }

    export function AsyncUploadFileAsTemplate(file: any, name: string, description: string, createUser: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let formData = new FormData();
            formData.append('file', file);
            formData.append('templateSlice', '{name:"' + name + '", description:"' + description + '",createUser:"' + createUser + '"}');

            console.log('Async File: ', formData);
            axios.post(TemplateService.uploadAsTemplate(), formData, {headers: {'content-type': 'multipart/form-data'}})
                .then((response: AxiosResponse) => {
                    // success message
                    console.log(response.data);
                    dispatch(CrossCuttingActionCreator.endRequest());
                })
                .catch(function (error: any) {
                    console.log(error);
                    // upload failed message
                    dispatch(CrossCuttingActionCreator.endRequest());
                });
        };
    }

    /* TODO was besseres hierfür ausdenken
    export function AsyncRenderTemplatePreview(file: any) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let formData = new FormData();
            formData.append('file', file);
            dispatch(CrossCuttingActionCreator.startRequest());
            axios.post(TemplateService.renderPreview(), formData)
                .then((response: AxiosResponse) => {
                    // success message
                    dispatch(CrossCuttingActionCreator.endRequest());
                })
                .catch(function (error: any) {
                    console.log(error);
                    // upload failed message
                    dispatch(CrossCuttingActionCreator.endRequest());
                });
        };
    }

*/
}