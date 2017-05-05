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
}

export interface APIProfileUpdateResponse {
    profile: APIProfile;
    notifications: Array<any>;
}
