import {InternalDatabase} from './model/InternalDatabase';
import {AdminState} from './model/admin/AdminState';
import {StatisticsStore} from './model/statistics/StatisticsStore';

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
    RequestCreateViewProfile,
    SaveProfile,
    RequestLanguages
}

export enum ProfileElementType {
    SectorEntry,
    TrainingEntry,
    EducationEntry,
    QualificationEntry,
    LanguageEntry,
    KeySkill,
    Project,
    CareerEntry
}




export interface ApplicationState {
    databaseReducer: InternalDatabase;
    adminReducer: AdminState;
    statisticsReducer: StatisticsStore;
}

