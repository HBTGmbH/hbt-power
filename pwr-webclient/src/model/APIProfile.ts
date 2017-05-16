import {NameEntity} from './NameEntity';
export interface APINameEntity {
    id: number;
    name: string;
}

// == LANGUAGES == //

export interface APILanguageSkill {
    id: number;
    language: APINameEntity;
    level: string;
}

export interface APIEducationStep {
    id: number;
    startDate: string;
    endDate: string;
    degree: string;
    education: APINameEntity;
}

// == QUALIFICATIONS == //

export interface APIQualificationEntry {
    id: number;
    date: string;
    qualification: APINameEntity;
}

export interface APITrainingEntry {
    id: number;
    startDate: string;
    endDate: string;
    training: APINameEntity;
}

// SECTORS //
export interface APISectorEntry {
    id: number;
    sector: APINameEntity;
}

export interface APIProject {
    id: number;
    name: string;
    description: string;
    endDate: Date;
    startDate: Date;
    broker: APINameEntity;
    client: APINameEntity;
    projectRoles: Array<APINameEntity>;
}

export interface APISkill {
    id: string,
    name: string,
    rating: number
}

export interface APICategory {
    id: string,
    name: string,
    categories: Array<APICategory>;
    skills: Array<APISkill>;
}

/**
 * Representation of the profile the API returns. Allows type-safe changing of the API response as the compiler will
 * give notifications.
 */
export interface APIProfile {
    id: number;
    description: string;
    currentPosition: string;
    trainingEntries: Array<APITrainingEntry>;
    languages: Array<APILanguageSkill>;
    qualification: Array<APIQualificationEntry>;
    education: Array<APIEducationStep>;
    sectors: Array<APISectorEntry>;
    projects: Array<APIProject>;
    rootCategories: Array<APICategory>;
}

export interface APIProfileUpdateResponse {
    profile: APIProfile;
    notifications: Array<any>;
}
