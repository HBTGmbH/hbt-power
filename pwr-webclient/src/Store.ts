import {InternalDatabase} from './model/InternalDatabase';

/**
 * State encapsulating all consultants.
 */
export interface AllConsultantsState {
    requestingConsultants: boolean;
}

export enum RequestStatus {
    Pending,
    Successful,
    Failiure,
    Inactive
}

export enum APIRequestType {
    RequestProjectRoles,
    RequestCompanies,
    RequestSectors,
    RequestCareers,
    RequestQualifications,
    RequestEducations,
    RequestProfile,
    SaveProfile,
    RequestLanguages
}

export enum ProfileElementType {
    SectorEntry,
    TrainingEntry,
    EducationEntry,
    QualificationEntry,
    LanguageEntry
}




export interface ApplicationState {
    updateConsultant: AllConsultantsState;
    databaseReducer: InternalDatabase;
}

