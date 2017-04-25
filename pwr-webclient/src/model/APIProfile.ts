export interface APILanguageSkill {
    id: number;
    level: string;
    language: {
        id: number;
        name: string;
    }
}

export interface APIEducation {
    id: number;
    date: string;
    education: {
        id: number;
        name: string;
    }
}

export interface APIQualification {
    id: number;
    date: string;
    qualification: {
        id: number;
        name: string;
    }
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
    qualification: Array<APIQualification>;
    education: Array<APIEducation>;
    sectors: Array<APISector>;
}
