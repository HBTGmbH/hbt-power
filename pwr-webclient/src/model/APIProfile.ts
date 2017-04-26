
export interface APILanguage {
    id: number;
    name: string;
}

export interface APILanguageSkill {
    id: number;
    language: APILanguage;
    level: string;
}

export interface APIEducation {
    id: number;
    name: string;
}

export interface APIEducationStep {
    id: number;
    date: string;
    education: APIEducation;
}

export interface APIQualification {
    id: number;
    name: string;
}

export interface APIQualificationEntry {
    id: number;
    date: string;
    qualification: APIQualification;
}

export interface APICareerPosition {
    id: number;
    position: string;
}

export interface APICareerElement {
    id: number;
    startDate: string;
    endDate: string;
    position: APICareerPosition;
}

export interface APISectorEntry {
    id: number;
    sector: APISector;
}

export interface APISector {
    id: number;
    name: string;
}

/**
 * Profile the API servers.
 */
export interface APIProfile {
    id: number;
    description: string;
    currentPosition: string;
    career: Array<APICareerElement>;
    languages: Array<APILanguageSkill>;
    qualification: Array<APIQualificationEntry>;
    education: Array<APIEducationStep>;
    sectors: Array<APISectorEntry>;
}
