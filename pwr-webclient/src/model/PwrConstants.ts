export const UNDEFINED_ID: string = null;

export const NEW_ENTITY_PREFIX: string = 'NEW';

export const DEFAULT_LANG_LEVEL: string = 'BASIC';

export const LEVENSHTEIN_FILTER_LEVEL: number = 2.0;

export const COOKIE_INITIALS_NAME = 'consultant_initials';

export const COOKIE_INITIALS_EXPIRATION_TIME = 3;

export const COOKIE_ADMIN_USERNAME = 'pwr_admin_username';

export const COOKIE_ADMIN_PASSWORD = 'pwr_admin_password';

export const COOKIE_ADMIN_EXPIRATION_TIME = {expires: 3}; // 3 Days expiration time

export const DESCRIPTION_CHARS_PER_LINE_LOWER = 20;

export const DESCRIPTION_CHARS_PER_LINE_UPPER = 200;

export const PROFILE_DESCRIPTION_LENGTH = 4000;

export function getRandomGreeting() {
    return GLOBAL_OPTIONS.greetings[Math.floor(Math.random() * GLOBAL_OPTIONS.greetings.length)];
}

declare const GLOBAL_OPTIONS: {
    defaultCharsPerLine: number;
    greetings: Array<string>;
};

