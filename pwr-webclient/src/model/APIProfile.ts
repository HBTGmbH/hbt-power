
// == LANGUAGES == //
export interface APILanguage {
    id: number;
    name: string;
}

export interface APILanguageSkill {
    id: number;
    language: APILanguage;
    level: string;
}

// == EDUCATIONS == //
export interface APIEducation {
    id: number;
    name: string;
}

export interface APIEducationStep {
    id: number;
    startDate: string;
    endDate: string;
    education: APIEducation;
}

// == QUALIFICATIONS == //
export interface APIQualification {
    id: number;
    name: string;
}

export interface APIQualificationEntry {
    id: number;
    date: string;
    qualification: APIQualification;
}

// == Training == //
export interface APITraining {
    id: number;
    name: string;
}

export interface APITrainingEntry {
    id: number;
    startDate: string;
    endDate: string;
    training: APITraining;
}

// SECTORS //
export interface APISectorEntry {
    id: number;
    sector: APISector;
}

export interface APISector {
    id: number;
    name: string;
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
