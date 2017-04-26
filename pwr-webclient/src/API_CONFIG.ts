export const API_HOST: string = "http://localhost";

export const API_PORT: string = "7777";

export const API_SUFFIX: string = "/api"

export const API_SUFFIX_PROFILE = "/profile";

export function getProfileAPIString(initials: string) : string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + "/" + initials + API_SUFFIX_PROFILE;
}

export function getLangSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + "/suggestions/languages";
}

export function getEducationSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + "/suggestions/educations";
}

export function getQualificationSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + "/suggestions/qualifications";
}