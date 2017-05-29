export const API_HOST: string = "http://localhost";

export const API_PORT: string = "8080";

export const API_SUFFIX: string = "/api";

export const API_SUFFIX_PROFILE = "";

export function getProfileAPIString(initials: string) : string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE + "/profiles/" + initials;
}

export function getLangSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE + "/suggestions/languages";
}

export function getEducationSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE  + "/suggestions/educations";
}

export function getQualificationSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE  + "/suggestions/qualifications";
}

export function getTrainingSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE  + "/suggestions/trainings";
}

export function getSectorsSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE  + "/suggestions/sectors";
}

export function getProjectRolesSuggestionAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE  + "/suggestions/projectroles";
}

export function getCompanySuggestionsAPIString(): string {
    return API_HOST + ":" + API_PORT + API_SUFFIX + API_SUFFIX_PROFILE  + "/suggestions/companies";
}
