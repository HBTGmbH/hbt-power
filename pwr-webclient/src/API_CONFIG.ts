import {SortableEntryField, SortableEntryType} from './model/view/NameComparableType';
declare const POWER_API_HOST: string;

declare const POWER_API_PORT: string;

declare const POWER_API_SUFFIX_PROFILE: string;

declare const POWER_API_HOST_STATISTICS: string;

declare const POWER_API_SUFFIX_STATISTICS: string;

declare const POWER_API_PORT_STATISTICS: string;

declare const POWER_API_HOST_SKILL: string;

declare const POWER_API_PORT_SKILL: string;

declare const POWER_API_SUFFIX_SKILL: string;

declare const POWER_PROFILE_META_INFO: string;

declare const POWER_API_META_INFO_REPORT: string;

// View Profile
declare const POWER_API_HOST_VIEW: string;
declare const POWER_API_PORT_VIEW: string;
declare const POWER_API_SUFFIX_VIEW: string;


export function getProfileBuildInfo(): string {
    return POWER_PROFILE_META_INFO + "/info";
}

export function getStatisticsBuildsInfo(): string {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/meta/info";
}

export function getSkillBuildInfo(): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/meta/info";
}

export function getReportBuildInfo(): string {
    return POWER_API_META_INFO_REPORT + "/info";
}

export function getSearchSkill(): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill/search";
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

export function patchConsultantActionString(initials: string) : string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE + "/consultants/" + initials;
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

export function getAllCurrentlyUsedSkillNames(): string {
    return POWER_API_HOST + ":" + POWER_API_PORT  + POWER_API_SUFFIX_PROFILE  + "/suggestions/skills";
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

export function getRootCategoryIds(): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/root";
}

export function getCategoryById(id: number): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + id;
}

export function getCategoryChildrenByCategoryId(id: number): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + id + "/children";
}

export function getSkillsForCategory(id: number): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + id + "/skills";
}

export function getSkillByName(): string {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill/byName";
}

export function getNameEntityUsageInfo() {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/entries/referencing";
}

export function getSkillUsageInfo() {
    return POWER_API_HOST_STATISTICS + ":" + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + "/statistics/skill/referencing";
}

export function postCategorizeSkill() {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill";
}

/**
 * String representing a delete operation on the blacklist.
 * @param id of the category to be whitelisted
 * @returns {string} the representing the full API URI
 */
export function deleteBlacklistCategory(id: number) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/blacklist/" + id;
}

export function patchSetIsDisplayCategory(categoryId: number, isDisplay: boolean) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + categoryId + "/display/" + isDisplay;
}

export function postLocaleToCategory(categoryId: number) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + categoryId + "/locale";
}

export function deleteLocaleFromCategory(categoryId: number, locale: string) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + categoryId + "/locale/" + locale;
}

export function skillLocale(categoryId: number, language: string) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill/" + categoryId + "/locale/" + language;
}

export function postNewCategory(parentId: number) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + parentId;
}

export function postNewSkill(categoryId: number) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill/category/" + categoryId;
}

export function deleteCustomSkill(skillId: number) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill/" + skillId;
}

export function deleteCategory(parentId: number) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/category/" + parentId;
}

export function patchMoveSkill(skillId: number, newCategoryId: number) {
    return POWER_API_HOST_SKILL + ":" + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + "/skill/" + skillId + "/category/" + newCategoryId;
}

export namespace ViewProfileService {

    function base() {
        return POWER_API_HOST_VIEW + ":" + POWER_API_PORT_VIEW + POWER_API_SUFFIX_VIEW;
    }

    export function getViewProfile(initials: string, id: string) {
       return base() + "/view/" + initials + "/" + id;
    }

    export function getViewProfileIds(initials: string) {
        return base() + "/view/" + initials;
    }

    export function postViewProfile(initials: string) {
        return getViewProfileIds(initials);
    }

    export function deleteViewProfile(initials: string, id: string) {
        return getViewProfile(initials, id);
    }

    function patchBase(initials: string, id: string) {
        return base() +  "/" + initials + "/view/" + id + "/";
    }

    export function patchMoveEntry(initials: string, id: string, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return patchBase(initials, id) + movableEntry + "/position/" + sourceIndex + "/" + targetIndex;
    }

    export function patchMoveNestedEntry(initials: string, id: string, container: string, containerIndex: number, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return patchBase(initials, id) + container + "/" + containerIndex + "/" + movableEntry + "/position/" + sourceIndex + "/" + targetIndex;
    }

    export function patchToggleEntry(initials: string, id: string, toggleableEntry: string, index: number, isEnabled: boolean) {
        return patchBase(initials, id) + toggleableEntry + "/" + index + "/visibility/" + isEnabled;
    }
    export function patchToggleNestedEntry(initials: string, id: string, container: string, containerIndex: number, toggleableEntry: string, index: number, isEnabled: boolean) {
        return patchBase(initials, id) + container + "/" + containerIndex + "/" + toggleableEntry + "/" + index + "/visibility/" + isEnabled;
    }

    export function patchSortEntry(initials: string, id: string, entryType: SortableEntryType, field: SortableEntryField) {
        return patchBase(initials, id) + SortableEntryType[entryType] + "/" + field + "/order";
    }

    export function patchToggleSkill(initials: string, id: string, isEnabled: boolean) {
        return patchBase(initials, id) + "/SKILL/visibility/" + isEnabled;
    }

    export function patchSetDisplayCategory(initials: string, id: string) {
        return patchBase(initials, id) + "/SKILL/display-category";
    }

    export function patchSortNestedEntry(initials: string, id: string, container: string, containerIndex: number, entryType: SortableEntryType, field: SortableEntryField) {
        return patchBase(initials, id) + container + "/" + containerIndex + "/" + SortableEntryType[entryType] + "/" + field + "/order";
    }

    export function postReport(initials: string, viewProfileId: string) {
        return base() +  "/view/" + initials + "/view/" + viewProfileId + "/report";
    }

    export function getBuildInfo(): string {
        return base() + "/meta/info";
    }

}