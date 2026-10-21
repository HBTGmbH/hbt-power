/**
 * Profile check (#139), as the profile service computes it (ProfileCheckService)
 */
export enum ProfileCheckHintType {
    MISSING = 'MISSING',
    INCOMPLETE = 'INCOMPLETE',
    OUTDATED = 'OUTDATED',
    UNSORTED = 'UNSORTED',
}

export enum ProfileCheckHintCode {
    SECTION_EMPTY = 'SECTION_EMPTY',
    DESCRIPTION_MISSING = 'DESCRIPTION_MISSING',
    DESCRIPTION_SHORT = 'DESCRIPTION_SHORT',
    PROJECT_INCOMPLETE = 'PROJECT_INCOMPLETE',
    PROJECTS_OUTDATED = 'PROJECTS_OUTDATED',
    NO_FOLLOW_UP_PROJECT = 'NO_FOLLOW_UP_PROJECT',
    RUNNING_PROJECT_OUTDATED = 'RUNNING_PROJECT_OUTDATED',
    SKILLS_OUTDATED = 'SKILLS_OUTDATED',
    SKILLS_UNSORTED = 'SKILLS_UNSORTED',
}

export enum ProfileSection {
    DESCRIPTION = 'DESCRIPTION',
    LANGUAGES = 'LANGUAGES',
    QUALIFICATIONS = 'QUALIFICATIONS',
    TRAININGS = 'TRAININGS',
    EDUCATION = 'EDUCATION',
    SECTORS = 'SECTORS',
    CAREER = 'CAREER',
    SPECIAL_FIELDS = 'SPECIAL_FIELDS',
    SKILLS = 'SKILLS',
    PROJECTS = 'PROJECTS',
}

export interface ProfileCheckHint {
    type: ProfileCheckHintType;
    code: ProfileCheckHintCode;
    section: ProfileSection;
    projectId: number | null;
    projectName: string | null;
    /** ISO date time; null if unknown */
    since: string | null;
    values: { [key: string]: any };
}

export interface ProfileCheck {
    initials: string;
    hints: Array<ProfileCheckHint>;
    lastEdited: string | null;
    skillsLastEdited: string | null;
    projectsLastEdited: string | null;
    lastConfirmed: string | null;
    skillTreeChecked: boolean;
}

/** One consultant in the admins' consultant list */
export interface ProfileCheckSummary {
    initials: string;
    name: string;
    hintCount: number;
    outdatedCount: number;
    lastEdited: string | null;
    lastConfirmed: string | null;
    confirmationsSinceLastChange: number;
}

/** "My profile is up to date", as logged for admins */
export interface ProfileConfirmation {
    id: number;
    confirmedAt: string;
    /** Login of the account the edge service forwarded; "lokal" without it */
    login: string;
    initials: string | null;
}
