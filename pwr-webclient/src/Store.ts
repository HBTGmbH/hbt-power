import {ConsultantProps} from './modules/consultant_module';
import {InternalDatabase} from './model/InternalDatabase';

/**
 * State encapsulating all consultants.
 */
export interface AllConsultantsState {
    consultants: Array<ConsultantProps>;
    requestingConsultants: boolean;
}

export enum RequestStatus {
    Pending,
    Successful,
    Failiure,
    Inactive
}

export enum APIRequestType {
    RequestProfile,
    SaveProfile,
    RequestLanguages
}



export interface ApplicationState {
    updateConsultant: AllConsultantsState;
    databaseReducer: InternalDatabase;
}

