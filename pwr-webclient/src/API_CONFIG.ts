declare const POWER_API_HOST: string;

declare const POWER_API_PORT: string;

declare const POWER_API_SUFFIX_PROFILE: string;

declare const POWER_API_HOST_STATISTICS: string;

declare const POWER_API_SUFFIX_STATISTICS: string;

declare const POWER_API_PORT_STATISTICS: string;

declare const POWER_API_HOST_SKILL: string;

declare const POWER_API_PORT_SKILL: string;

declare const POWER_API_SUFFIX_SKILL: string;

export function getSearchSkill(skillname: string): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill/search/" + skillname;
}

export function getConsultantApiString(initials: string) : string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/consultants/" + initials;
}

export function getAdminAuthAPIString() : string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE + "/admin";
}

export function getAllConsultantsString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/consultants";
}

export function postConsultantActionString() : string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE + "/consultants";
}

export function getNotificationAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE + "/admin/notifications";
}

export function getNotificationTrashAPIString(): string {
    return getNotificationAPIString() + "/trash"
}

export function getProfileAPIString(initials: string) : string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/profiles/" + initials;
}

export function getLangSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE + "/suggestions/languages";
}

export function getEducationSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE  + "/suggestions/educations";
}

export function getQualificationSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE  + "/suggestions/qualifications";
}

export function getTrainingSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE  + "/suggestions/trainings";
}

export function getSectorsSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE  + "/suggestions/sectors";
}

export function getKeySkillsSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE  + "/suggestions/keyskills";
}

export function getCareerSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE  + "/suggestions/career";
}


export function getProjectRolesSuggestionAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE  + "/suggestions/projectroles";
}

export function getCompanySuggestionsAPIString(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE  + "/suggestions/companies";
}

export function getPostViewProfileAPIString(initials: string): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE + "/profiles/" + initials + "/view";
}

export function GetPostMutateViewProfile(id: string) : string {
    return getViewProfileString(id) + "/entries";
}

export function getViewProfileString(id: string): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/profiles/view/" + id;
}

export function deleteViewProfileString(id: string, initials: string): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/profiles/" + initials + "/view/" + id;
}

export function getAllViewProfilesString(initials: string): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/profiles/" + initials + "/view";
}

export function postEditViewProfileDetails(id: string): string {
    return getViewProfileString(id) + "/details";
}

export function postDuplicateViewProfile(id: string): string {
    return getViewProfileString(id);
}

export function postCreatePDFProfile(initials: string): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/consultants/" + initials + "/reports";
}

export function getExportDocuments(initials: string): string {
    return POWER_API_HOST + ":" + POWER_API_PORT + POWER_API_SUFFIX_PROFILE + "/consultants/" + initials + "/reports";
}

export function getProfileImageLocation(initials: string): string {
    return "/img/profile_pictures/foto_" + initials + ".jpg"
}

export function getSkillUsagesAbsolute(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS +  "/statistics/skill/usage/absolute";
}

export function getSkillUsageRelative(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS +  "/statistics/skill/usage/relative";
}

export function getProfileStatistics(initials: string): string {
    return  POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/skill/common/" + initials;
}

export function getKMeansProfileNetwork(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/network/kmeans";
}

export function getKMedProfileNetwork(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/network/kmed";
}

export function headStatisticsServiceAvailable(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics";
}

export function getConsultantClusterInfo(initials: string): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/network/consultant/" + initials;
}

export function getScatterSkills(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/skill/level";
}

export function postFindConsultantBySkills(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/consultant/find/skills";
}
