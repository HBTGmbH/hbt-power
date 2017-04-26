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
    RequestSectors,
    RequestCareers,
    RequestQualifications,
    RequestEducations,
    RequestProfile,
    SaveProfile,
    RequestLanguages
}

export enum DateFieldType {
    CareerFrom,
    CareerTo,
    EducationDate,
    QualificationDate
}

export enum ProfileElementType {
    SectorEntry,
    CareerEntry,
    EducationEntry,
    QualificationEntry,
    LanguageEntry
}



export interface ApplicationState {
    updateConsultant: AllConsultantsState;
    databaseReducer: InternalDatabase;
}

