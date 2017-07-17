export interface APINameEntity {
    id: number;
    name: string;
    type: string;
}

// == LANGUAGES == //

export interface APILanguageSkill {
    id: number;
    nameEntity: APINameEntity;
    level: string;
}

export interface APIEducationStep {
    id: number;
    startDate: string;
    endDate: string;
    degree: string;
    nameEntity: APINameEntity;
}

// == QUALIFICATIONS == //

export interface APIQualificationEntry {
    id: number;
    date: string;
    nameEntity: APINameEntity;
}

export interface APITrainingEntry {
    id: number;
    startDate: string;
    endDate: string;
    nameEntity: APINameEntity;
}

export interface APICareerEntry {
    id: number;
    startDate: string;
    endDate: string;
    nameEntity: APINameEntity;
}

export interface APIKeySkill {
    id: number;
    nameEntity: APINameEntity;
}

// SECTORS //
export interface APISectorEntry {
    id: number;
    nameEntity: APINameEntity;
}

export interface APIProject {
    id: number;
    name: string;
    description: string;
    endDate: Date;
    startDate: Date;
    broker: APINameEntity;
    client: APINameEntity;
    skills: Array<APISkill>;
    projectRoles: Array<APINameEntity>;
}

export interface APISkill {
    id: string,
    name: string,
    rating: number
}

/**
 * Representation of the profile the API returns. Allows type-safe changing of the API response as the compiler will
 * give notifications.
 */
export interface APIProfile {
    id: number;
    description: string;
    currentPosition: string;
    lastEdited: string;
    trainingEntries: Array<APITrainingEntry>;
    careerEntries: Array<APICareerEntry>;
    keySkillEntries: Array<APIKeySkill>;
    languages: Array<APILanguageSkill>;
    qualification: Array<APIQualificationEntry>;
    education: Array<APIEducationStep>;
    sectors: Array<APISectorEntry>;
    projects: Array<APIProject>;
    skills: Array<APISkill>;

}

export interface APIProfileUpdateResponse {
    profile: APIProfile;
    notifications: Array<any>;
}

/**
 * Just the relevant information
 */
export interface APIConsultant {
    initials: string;
    firstName: string;
    lastName: string;
    title: string;
    profile: APIProfile;
    birthDate: string;
}
