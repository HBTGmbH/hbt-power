import {PowerHttpClient} from './PowerHttpClient';
import {HousekeepingFindings} from '../model/admin/HousekeepingFindings';
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
        return this.get(url);
    }

    /**
     * Like getReportDataForUser, but without error alert: for polling while a report is created
     */
    public pollReportDataForUser(initials: string): Promise<ReportData[]> {
        return this.getQuietly(this.base() + '/report/' + initials);
    }

    public getReport(id): Promise<any> {
        const url = this.base() + '/report/file/' + id;
        return this.get(url, {responseType: 'arraybuffer'});
    }

    public deleteReport(id): Promise<unknown> {
        const url = this.base() + '/report/delete/' + id;
        return this.delete(url);
    }

    /**
     * The housekeeping checks of the service (#242), without error alert: the housekeeping page
     * shows a service that does not answer next to the others
     */
    public getHousekeeping = (): Promise<Array<HousekeepingFindings>> => {
        return this.getQuietly(this.base() + '/admin/housekeeping');
    };

    /** Housekeeping, rubric old (#289): data older than the limit of the service, the newest of each consultant excepted */
    public getOldHousekeeping = (): Promise<Array<HousekeepingFindings>> => {
        return this.getQuietly(this.base() + '/admin/housekeeping/old');
    };

    /** Deletes what the check of old data finds now; the answer says how many */
    public cleanOldHousekeeping = (check: string): Promise<HousekeepingFindings> => {
        const url = this.base() + '/admin/housekeeping/old/' + encodeURIComponent(check);
        return this.delete(url);
    };

    /** Deletes what the check finds now; the answer says how many */
    public cleanHousekeeping = (check: string): Promise<HousekeepingFindings> => {
        const url = this.base() + '/admin/housekeeping/' + encodeURIComponent(check);
        return this.delete(url);
    };
}
