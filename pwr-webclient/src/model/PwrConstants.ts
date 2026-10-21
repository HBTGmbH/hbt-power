export const NEW_ENTITY_PREFIX: string = 'NEW';

export const PROFILE_DESCRIPTION_LENGTH = 4000;

/** Columns of a project reference in the profile service (Project, HBTPowerConstants) (#141) */
export const PROJECT_NAME_LENGTH = 255;
export const PROJECT_DESCRIPTION_LENGTH = 4000;

export const NON_PERSISTENT_ID = -1;


export function getRandomGreeting() {
    return GLOBAL_OPTIONS.greetings[Math.floor(Math.random() * GLOBAL_OPTIONS.greetings.length)];
}

declare const GLOBAL_OPTIONS: {
    defaultCharsPerLine: number;
    greetings: Array<string>;
};

