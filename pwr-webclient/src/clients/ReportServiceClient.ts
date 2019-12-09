import {PowerHttpClient} from './PowerHttpClient';
import axios from 'axios';
import {ReportData} from '../model/view/ReportData';
import {TemplateActionCreator} from '../reducers/template/TemplateActionCreator';

declare const POWER_REPORT_SERVICE_URL: string;

export class ReportServiceClient  extends PowerHttpClient{

    private static _instance: ReportServiceClient;

    private constructor() {
        super();
    }

    public static instance(): ReportServiceClient {
        if (!this._instance) {
            this._instance = new ReportServiceClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_REPORT_SERVICE_URL;
    }


    public getReportDataForUser(initials: string): Promise<ReportData[]> {
        const url = this.base() + "/report/" + initials;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getReport(id): void {
        const url = this.base() + "/report/file/" + id;
        TemplateActionCreator.DownloadReportFile(url);
    }

    public deleteReport(id): Promise<unknown> {
        const url = this.base() + "/report/delete/" + id;
        return this.executeRequest(axios.delete(url));
    }

    public getFileById(id: string) {
        const url = this.base() + '/file/' + id;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

}
