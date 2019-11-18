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
        console.log(url);
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getReport(id): Promise<unknown> {
        const url = this.base() + "/report/file/" + id;
        console.log(url);
        this.beginRequest();
        return this.executeRequest(axios.get(url, {responseType: 'blob'}));

        //TODO das hier unten funktioniert prinzipiell ist aber unsauber
        /*axios({
            url: url,
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'file.docx');
            document.body.appendChild(link);
            link.click();
        });*/
    }

}
