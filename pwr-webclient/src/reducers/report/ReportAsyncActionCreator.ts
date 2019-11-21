import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {ReportServiceClient} from './ReportServiceClient';
import {reportLoadAction} from './ReportActions';

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
            reportServiceClient.getReport(id);
        };
    }

    public static deleteReportFile(id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            reportServiceClient.deleteReport(id).then( res => console.log("Deleted report: " + id));
        };
    }
}
