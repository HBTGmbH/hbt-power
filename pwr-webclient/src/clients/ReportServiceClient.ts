import {PowerHttpClient} from './PowerHttpClient';
import {ReportData} from '../model/view/ReportData';

declare const POWER_REPORT_SERVICE_URL: string;

export class ReportServiceClient extends PowerHttpClient {

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

    public getReportURL(id: number): string {
        return this.base() + '/report/file/' + id;
    }

    public getReportDataForUser(initials: string): Promise<ReportData[]> {
        const url = this.base() + '/report/' + initials;
        this.beginRequest();
        return this.get(url);
    }

    /**
     * Like getReportDataForUser, but without loading spinner and error alert: for polling while a report is created
     */
    public pollReportDataForUser(initials: string): Promise<ReportData[]> {
        return this.getQuietly(this.base() + '/report/' + initials);
    }

    public getReport(id): Promise<any> {
        const url = this.base() + '/report/file/' + id;
        this.beginRequest();
        return this.get(url, {responseType: 'arraybuffer'});
    }

    public deleteReport(id): Promise<unknown> {
        const url = this.base() + '/report/delete/' + id;
        return this.delete(url);
    }

    public getFileById(id: string) {
        const url = this.base() + '/file/' + id;
        this.beginRequest();
        return this.get(url);
    }

}
