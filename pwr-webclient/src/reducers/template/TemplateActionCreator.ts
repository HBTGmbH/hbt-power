import {ActionType} from '../ActionType';
import {TemplateActions} from './TemplateActions';
import {Template} from '../../model/view/Template';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {CrossCuttingActionCreator} from '../crosscutting/CrossCuttingActionCreator';
import {AdminActionCreator} from '../admin/AdminActionCreator';
import {Alerts} from '../../utils/Alerts';
import {TemplateClient} from '../../clients/TemplateClient';
import {makeDeferrable} from '../deferred/AsyncActionUnWrapper';
import {ReportServiceClient} from '../../clients/ReportServiceClient';

const templateClient = TemplateClient.instance();
const reportClient = ReportServiceClient.instance();

export class TemplateActionCreator {


    /**
     * Fuegt ein vom view-service empfangenes Template dem TemplateState hinzu
     *
     * @param templateResponse
     * @param {Dispatch<ApplicationState>} dispatch
     * @constructor
     */
    private static TemplateReceived(templateResponse: Template, dispatch: redux.Dispatch<ApplicationState>) {
        let template: Template = new Template(templateResponse);
        dispatch(TemplateActions.SetTemplate(template));
    }

    private static PreviewReceived(id: string, response: AxiosResponse, dispatch: redux.Dispatch<ApplicationState>) {
        dispatch(TemplateActions.SetPreview(id, 'hardcoded filename', 'hardcoded content', response.data));
    }

    private static DownloadFile(response: AxiosResponse) {
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
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            templateClient.changeTemplate(template.id, template)
                .then((response) => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))

                .catch(() => dispatch(TemplateActions.TemplateRequestFailed()))
                .catch((error: AxiosError) => console.error(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteTemplate)
    public static AsyncDeleteTemplate(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            templateClient.deleteTemplate(id)
                .then(() => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()))

                .catch(() => dispatch(TemplateActions.TemplateRequestFailed()))
                .catch((error: AxiosError) => console.error(error));
        };
    }

    public static DownloadReportFile(location: string) {
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
        name = name.split('.')[0];
        a.download = name;
        //programatically click the link to trigger the download
        a.click();
        //release the reference to the file by revoking the Object URL
        window.URL.revokeObjectURL(url);
    }

    public static AsyncDownloadFile(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            reportClient.getFileById(id)
                .then((response: AxiosResponse) => TemplateActionCreator.DownloadFile(response))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error: AxiosError) => console.error('AsyncDownloadFile', error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }


    private static AsyncLoadTemplate(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            templateClient.getTemplateById(id)
                .then((template) => TemplateActionCreator.TemplateReceived(template, dispatch))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error: AxiosError) => console.error('AsyncLoadTemplate', error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));


        };
    }

    public static AsyncLoadAllTemplates() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(TemplateActions.ClearTemplates());
            templateClient.getAllTemplates()
                .then((response) => response.forEach(id => dispatch(TemplateActionCreator.AsyncLoadTemplate(id))))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }


    public static AsyncLoadPreview(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            if (id != '') {
                dispatch(CrossCuttingActionCreator.startRequest());
                templateClient.getPreview(id)
                    .then((response: AxiosResponse) => TemplateActionCreator.PreviewReceived(id, response.data, dispatch))
                    .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                    .catch((error) => console.error(error))
                    .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
            }
        };
    }


    public static AsyncLoadAllPreviews() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            templateClient.getAllPreviews()
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }

    public static AsyncLoadAllFiles() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            templateClient.getAllFiles()
                .then((response) => dispatch(CrossCuttingActionCreator.endRequest()))

                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()));
        };
    }

    public static AsyncUploadFileAsTemplate(file: any, name: string, description: string, createUser: string) {
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
