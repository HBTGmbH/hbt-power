import {PowerHttpClient} from '../../../clients/PowerHttpClient';

import {Consultant} from './model/Consultant';

declare const POWER_PROFILE_SERVICE_URL: string;

export class ConsultantClient extends PowerHttpClient {


    private static _instance: ConsultantClient;

    private constructor() {
        super();
    }

    public static instance(): ConsultantClient {
        if (!this._instance) {
            this._instance = new ConsultantClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_PROFILE_SERVICE_URL;
    }


    public getConsultant(initials: string): Promise<Consultant> {
        const url = this.base() + '/consultants/' + initials;
        this.beginRequest();
        return this.get(url);
    }
}

