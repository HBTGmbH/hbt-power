import * as redux from 'redux';
import {ReportServiceClient} from '../../clients/ReportServiceClient';
import {reportLoadAction} from './ReportActions';
import {AxiosResponse} from 'axios';
import {ReportData} from '../../model/view/ReportData';

const reportServiceClient = ReportServiceClient.instance();

export class ReportAsyncActionCreator {


    public static loadAllReportData(initials: string) {
        return function (dispatch: redux.Dispatch) {
            reportServiceClient.getReportDataForUser(initials).then(reportDataList => {
                    dispatch(reportLoadAction(reportDataList));
                }
            ).catch(error => console.error(error));
        };
    }

    public static deleteReportFile(id: number, cb: () => void) {
        return function (dispatch: redux.Dispatch) {
            reportServiceClient.deleteReport(id).then(res => {
                cb();
            });
        };
    }

    public static getReportFile(reportData: ReportData) {
        return function (dispatch: redux.Dispatch) {
            reportServiceClient.getReport(reportData.id)
                .then(response => ReportAsyncActionCreator.downloadReportFile(response, reportData))

                .catch(error => console.error(error));
        };
    }

    public static downloadReportFile(response: AxiosResponse, reportData: ReportData) {

        let blob: Blob = new Blob([response.data], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
        ReportAsyncActionCreator.downloadBlob(blob, reportData.fileName);
    }

    private static downloadBlob(file: Blob, fileName: string): void {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            ReportAsyncActionCreator.downloadFile(fileName, objectUrl);
            URL.revokeObjectURL(objectUrl);
        }
    }

    private static downloadFile(download: string, path: string): void {
        const link = document.createElement('a');
        link.download = download;
        link.href = path;
        link.click();
        link.remove();
    }
}
