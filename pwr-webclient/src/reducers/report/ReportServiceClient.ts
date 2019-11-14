import {PowerHttpClient} from '../../clients/PowerHttpClient';
import axios from 'axios';
import {ReportData} from '../../model/view/ReportData';

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
        console.log(url)
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getReport(id): Promise<unknown> {
        this.beginRequest();
        return this.executeRequest(axios.get(POWER_REPORT_SERVICE_URL + "/file/" + id));
    }

}
