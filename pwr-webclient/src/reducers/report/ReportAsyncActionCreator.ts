import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {ReportServiceClient} from '../../clients/ReportServiceClient';
import {reportLoadAction} from './ReportActions';
import {AxiosResponse} from 'axios';
import {ReportData} from '../../model/view/ReportData';

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

    public static deleteReportFile(id: number, cb: () => void) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            reportServiceClient.deleteReport(id).then(res => {
                cb();
            });
        };
    }

    public static getReportFile(reportData: ReportData) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            reportServiceClient.getReport(reportData.id)
                .then(response => ReportAsyncActionCreator.downloadReportFile(response, reportData))

                .catch(error => console.error(error));
        };
    }

    public static downloadReportFile(response: AxiosResponse, reportData: ReportData) {

        const location = reportServiceClient.getReportURL(reportData.id);
        let blob: Blob = new Blob([response.data], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
        let a: any = document.createElement('a');
        a.style = 'display: none';
        a.href = location;
        let url = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

    }
}
