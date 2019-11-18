import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {ReportServiceClient} from './ReportServiceClient';
import {reportLoadAction} from './ReportActions';
import {TemplateActionCreator} from '../template/TemplateActionCreator';

const reportServiceClient = ReportServiceClient.instance();

export class ReportAsyncActionCreator {


    public static loadAllReportData(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            reportServiceClient.getReportDataForUser(initials).then(reportDataList => {
                    dispatch(reportLoadAction(reportDataList));
                }
            ).catch(error => console.error(error));
        };
    }

    public static getReportFile(id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            console.log("calle client");
            reportServiceClient.getReport(id).then((response : Blob) => {
                console.log(response);
                TemplateActionCreator.DownloadReportFile(response.type)
            }).catch(error => console.error(error));
        };
    }
}
