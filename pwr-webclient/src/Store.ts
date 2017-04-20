import {ConsultantLocalProps, ConsultantProps} from './modules/consultant_module';

/**
 * State encapsulating all consultants.
 */
export interface AllConsultantsState {
    consultants: Array<ConsultantProps>;
    requestingConsultants: boolean;
}

/**
 * Language skill that wraps a language name and its level.
 */
export interface LanguageSkill {
    name: string;
    languageLevel: LanguageLevel;
}

export enum LanguageLevel {
    Beginner,
    Apprentice,
    Expert,
    Native
}

export interface CareerStep {
    startDate: Date;
    endDate: Date;
    name: string;
}

export interface EducationStep {
    date: Date;
    name: string;
}

export interface Qualification {
    date: Date;
    name: string;
}

export enum RequestStatus {
    Pending,
    Successful,
    Failiure
}

export interface ConsultantProfile {
    abstract: string;
    languages: LanguageSkill[];
    sectors: Array<string>;
    career: Array<CareerStep>;
    education: Array<EducationStep>;
    qualifications: Array<Qualification>;
}

/**
 * State for a single consultant profile.
 */
export interface SingleProfile {
    profile: ConsultantProfile;

    requestProfileStatus: RequestStatus;

    possibleSectors: string[]
    possibleLanguageNames: string[];

}

export interface ApplicationState {
    updateConsultant: AllConsultantsState;
    singleProfile: SingleProfile;
}

