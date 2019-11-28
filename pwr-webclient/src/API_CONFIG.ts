import {SortableEntryField, SortableEntryType} from './model/view/NameComparableType';
import {EntryRenderers} from './modules/home/view/entries/EntryRenderers';

declare const POWER_API_HOST_STATISTICS: string;

declare const POWER_API_SUFFIX_STATISTICS: string;

declare const POWER_API_PORT_STATISTICS: string;

declare const POWER_API_HOST_SKILL: string;

declare const POWER_API_PORT_SKILL: string;

declare const POWER_API_SUFFIX_SKILL: string;

declare const POWER_API_META_INFO_REPORT: string;

declare const POWER_IMAGE_PATH: string;

// View Profile
declare const POWER_API_HOST_VIEW: string;
declare const POWER_API_PORT_VIEW: string;
declare const POWER_API_SUFFIX_VIEW: string;

export function getImagePath(): string {
    return POWER_IMAGE_PATH;
}

export function getStatisticsBuildsInfo(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/meta/info';
}

export function getSkillBuildInfo(): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/meta/info';
}

export function getReportBuildInfo(): string {
    return POWER_API_META_INFO_REPORT + '/actuator/info';
}

export function getSearchSkill(): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/search';
}

export function getProfileImageLocation(initials: string): string {
    return POWER_IMAGE_PATH + '/profile_pictures/foto_' + initials + '.jpg';
}

export function getSkillUsagesAbsolute(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/skill/usage/absolute';
}

export function getSkillUsageRelative(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/skill/usage/relative';
}

export function getProfileStatistics(initials: string): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/skill/common/' + initials;
}

export function getKMedProfileNetwork(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/network/kmed';
}

export function headStatisticsServiceAvailable(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics';
}

export function getConsultantClusterInfo(initials: string): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/network/consultant/' + initials;
}

export function getScatterSkills(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/skill/level';
}

export function postFindConsultantBySkills(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/consultant/find/skills';
}

export function getRootCategoryIds(): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/root';
}

export function getCategoryById(id: number): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + id;
}

export function getCategoryChildrenByCategoryId(id: number): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + id + '/children';
}

export function getSkillsForCategory(id: number): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + id + '/skills';
}

export function getSkillByName(): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/byName';
}

export function getNameEntityUsageInfo() {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/entries/referencing';
}

export function getSkillUsageInfo() {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/statistics/skill/referencing';
}

export function postCategorizeSkill() {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill';
}

export function getFullTree() {
    //return 'http://localhost:9003/skill/tree/debug';
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/tree';
}

/**
 * String representing a delete operation on the blacklist.
 * @param id of the category to be whitelisted
 * @returns {string} the representing the full API URI
 */
export function deleteBlacklistCategory(id: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/blacklist/' + id;
}

export function patchSetIsDisplayCategory(categoryId: number, isDisplay: boolean) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + categoryId + '/display/' + isDisplay;
}

export function postLocaleToCategory(categoryId: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + categoryId + '/locale';
}

export function deleteLocaleFromCategory(categoryId: number, locale: string) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + categoryId + '/locale/' + locale;
}

export function skillLocale(categoryId: number, language: string) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/' + categoryId + '/locale/' + language;
}

export function skillVersion(skillId: number, newVersion: string) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/' + skillId + '/version/' + newVersion;
}

export function postNewCategory(parentId: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + parentId;
}

export function postNewSkill(categoryId: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/category/' + categoryId;
}

export function deleteCustomSkill(skillId: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/' + skillId;
}

export function deleteCategory(parentId: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + parentId;
}

export function patchMoveCategory(newParentId: number, toMoveId: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/category/' + toMoveId + '/category/' + newParentId;
}

export function patchMoveSkill(skillId: number, newCategoryId: number) {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/skill/' + skillId + '/category/' + newCategoryId;
}


export namespace ViewProfileService {

    import renderTraining = EntryRenderers.renderTraining;

    function base() {
        //return POWER_API_HOST_VIEW + ':' + POWER_API_PORT_VIEW + POWER_API_SUFFIX_VIEW;
        return 'http://localhost:9008';
    }

    export function getParentCategories(skillName: string) {
        return base() + '/tst/view/0/parent/' + skillName;
    }

    export function createChangedViewProfile(initials: string, oldId: string) {
        return base() + '/view/update/' + initials + '/' + oldId;
    }

    export function getViewProfile(initials: string, id: string) {
        return base() + '/view/' + initials + '/' + id;
    }

    export function getViewProfileIds(initials: string) {
        return base() + '/view/' + initials;
    }

    export function postViewProfile(initials: string) {
        return getViewProfileIds(initials);
    }

    export function deleteViewProfile(initials: string, id: string) {
        return getViewProfile(initials, id);
    }

    function patchBase(initials: string, id: string) {
        return base() + '/' + initials + '/view/' + id + '/';
    }

    export function patchMoveEntry(initials: string, id: string, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return patchBase(initials, id) + movableEntry + '/position/' + sourceIndex + '/' + targetIndex;
    }

    export function patchMoveNestedEntry(initials: string, id: string, container: string, containerIndex: number, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return patchBase(initials, id) + container + '/' + containerIndex + '/' + movableEntry + '/position/' + sourceIndex + '/' + targetIndex;
    }

    export function patchToggleEntry(initials: string, id: string, toggleableEntry: string, index: number, isEnabled: boolean) {
        return patchBase(initials, id) + toggleableEntry + '/' + index + '/visibility/' + isEnabled;
    }

    export function patchToggleNestedEntry(initials: string, id: string, container: string, containerIndex: number, toggleableEntry: string, index: number, isEnabled: boolean) {
        return patchBase(initials, id) + container + '/' + containerIndex + '/' + toggleableEntry + '/' + index + '/visibility/' + isEnabled;
    }

    export function patchSortEntry(initials: string, id: string, entryType: SortableEntryType, field: SortableEntryField) {
        return patchBase(initials, id) + SortableEntryType[entryType] + '/' + field + '/order';
    }

    export function patchToggleSkill(initials: string, id: string, isEnabled: boolean) {
        return patchBase(initials, id) + 'SKILL/visibility/' + isEnabled;
    }

    export function patchSetDisplayCategory(initials: string, id: string) {
        return patchBase(initials, id) + 'SKILL/display-category';
    }

    export function patchSortNestedEntry(initials: string, id: string, container: string, containerIndex: number, entryType: SortableEntryType, field: SortableEntryField) {
        return patchBase(initials, id) + container + '/' + containerIndex + '/' + SortableEntryType[entryType] + '/' + field + '/order';
    }

    export function patchToggleVersion(initials: string, id: string, skillName: string, versionName: string, isEnabled: boolean) {
        return patchBase(initials, id) + 'SKILL/visibility/version/' + isEnabled;
    }

    export function postReport(initials: string, viewProfileId: string, templateId: string) {
        return base() + '/view/' + initials + '/view/' + viewProfileId + '/' + templateId + '/report';
    }

    export function patchPartialUpdate(initials: string, viewProfileId: string) {
        return base() + '/view/' + initials + '/view/' + viewProfileId + '/info';
    }

    export function patchDescription(initials: string, viewProfileId: string) {
        return patchBase(initials, viewProfileId) + 'DESCRIPTION';
    }

    export function getBuildInfo(): string {
        return base() + '/actuator/info';
    }

}

export namespace TemplateService {
    function base() {
        return POWER_API_HOST_VIEW + ':' + POWER_API_PORT_VIEW + POWER_API_SUFFIX_VIEW;
    }

    export function getAllTemplates() {
        return base() + '/template/';
    }

    export function uploadAsTemplate() {
        return base() + '/template/';
    }

    export function deleteTemplate(id: string) {
        return base() + '/template/' + id;
    }

    export function getTemplateById(id: string) {
        return base() + '/template' + '/' + id;
    }

    export function changeTemplate(id: string) {
        return base() + '/template' + '/' + id;
    }

    export function getPreview(id: string) {
        return base() + '/template' + '/preview' + '/' + id;
    }

    export function getAllPreviews() {
        return base() + '/template' + '/preview';
    }

    export function getAllFiles() {
        return base() + '/file';
    }

}

export namespace ReportService {
    function base() {
        return POWER_API_HOST + ':' + POWER_API_PORT_REPORT + POWER_API_SUFFIX_REPORT;
    }

    export function getFileById(id: string) {
        return base() + '/file/' + id;
    }
}
