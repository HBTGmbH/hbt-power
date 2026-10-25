import {ActionType} from '../ActionType';
import {TemplateActions} from './TemplateActions';
import {Template} from '../../model/view/Template';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {AdminActionCreator} from '../admin/AdminActionCreator';
import {TemplateClient} from '../../clients/TemplateClient';
import {makeDeferrable} from '../deferred/AsyncActionUnWrapper';
import {confirmDeleteByName} from '../deferred/DeferredActions';
import {ReportServiceClient} from '../../clients/ReportServiceClient';
import {ThunkDispatch} from 'redux-thunk';

const templateClient = TemplateClient.instance();

export class TemplateActionCreator {

    /**
     * Fuegt ein vom view-service empfangenes Template dem TemplateState hinzu
     *
     * @param templateResponse
     * @param {Dispatch<ApplicationState>} dispatch
     * @constructor
     */
    private static TemplateReceived(templateResponse: Template, dispatch: redux.Dispatch) {
        let template: Template = new Template(templateResponse);
        dispatch(TemplateActions.SetTemplate(template));
    }

    public static DownloadFile(response: AxiosResponse) {
        console.info('File received');
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

    public static AsyncChangeTemplate(template: Template) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            templateClient.changeTemplate(template)
                .then(() => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))
                .catch(() => dispatch(TemplateActions.TemplateRequestFailed()))
                .catch((error: AxiosError) => console.error(error));
        };
    }

    /** The name of the template has to be entered twice (#181) */
    @makeDeferrable(ActionType.AsyncDeleteTemplate, (id: string, name: string) => confirmDeleteByName('Template', name))
    public static AsyncDeleteTemplate(id: string, name: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            templateClient.deleteTemplate(id)
                .then(() => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))

                .catch(() => dispatch(TemplateActions.TemplateRequestFailed()))
                .catch((error: AxiosError) => console.error(error));
        };
    }



    private static AsyncLoadTemplate(id: string) {
        return function (dispatch: redux.Dispatch) {
            templateClient.getTemplateById(id)
                .then((template) => TemplateActionCreator.TemplateReceived(template, dispatch))
                .catch((error: AxiosError) => console.error('AsyncLoadTemplate', error));

        };
    }

    public static AsyncLoadAllTemplates() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            dispatch(TemplateActions.ClearTemplates());
            templateClient.getAllTemplates()
                .then((response) => response.forEach(id => dispatch(TemplateActionCreator.AsyncLoadTemplate(id))))
                .catch((error) => console.error(error));
        };
    }


    public static AsyncUploadFileAsTemplate(file: any, name: string, description: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('templateSlice', JSON.stringify({
                name: name,
                description: description
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
                // It shows in the list
                .then(() => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))
                // The client shows the error
                .catch((error) => console.error(error))
                .finally(() => {
                    dispatch(AdminActionCreator.SetReportUploadPending(false));
                    dispatch(AdminActionCreator.SetReportUploadProgress(0));
                });
        };
    }
}
