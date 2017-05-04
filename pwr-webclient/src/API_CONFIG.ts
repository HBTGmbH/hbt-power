export const API_HOST: string = "http://localhost";

export const API_PORT: string = "8080";

export const API_SUFFIX: string = "/api";

export const API_SUFFIX_PROFILE = "/profiles";

export function getProfileAPIString(initials: string) : string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE + "/" + initials;
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

export function getTrainingSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + "/suggestions/trainings";
}

export function getSectorsSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + "/suggestions/sectors";
}
