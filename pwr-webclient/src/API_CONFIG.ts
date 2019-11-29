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
