import {CONFIG} from './Config';
import {StringUtils} from './utils/StringUtil';

/**
 * Paths used for routing. Central point of configuration for routing information.
 */
export class Paths {
    public static readonly APP_ROOT = CONFIG.APP_PATH + '/';
    public static readonly ADMIN_BASE = CONFIG.APP_PATH + '/admin/';
    public static readonly ADMIN_INBOX = CONFIG.APP_PATH + '/admin/home/inbox';
    public static readonly ADMIN_TRASHBOX = CONFIG.APP_PATH + '/admin/home/trashbox';
    public static readonly ADMIN_CONSULTANTS = CONFIG.APP_PATH + '/admin/home/consultants';
    public static readonly ADMIN_TEMPLATES = CONFIG.APP_PATH + '/admin/home/templates';
    /** The slug is only for reading, the ID selects (#211) */
    public static readonly ADMIN_TEMPLATE = CONFIG.APP_PATH + '/admin/home/templates/:templateId/:slug?';
    public static readonly ADMIN_STATISTICS_SKILL = CONFIG.APP_PATH + '/admin/home/statistics/skills';
    public static readonly ADMIN_INFO_SKILLTREE = CONFIG.APP_PATH + '/admin/home/info/skilltree';
    /** The slug is only for reading, the ID selects (#180) */
    public static readonly ADMIN_INFO_SKILLTREE_SKILL = CONFIG.APP_PATH + '/admin/home/info/skilltree/skill/:skillId/:slug?';
    public static readonly ADMIN_INFO_SKILLTREE_CATEGORY = CONFIG.APP_PATH + '/admin/home/info/skilltree/category/:categoryId/:slug?';
    public static readonly ADMIN_INFO_NAME_ENTITY = CONFIG.APP_PATH + '/admin/home/info/names';
    /** Type and entry of the profile elements in the URL (#212); the slug is only for reading, the ID selects */
    public static readonly ADMIN_INFO_NAME_ENTITY_TYPE = CONFIG.APP_PATH + '/admin/home/info/names/:type';
    public static readonly ADMIN_INFO_NAME_ENTITY_ENTRY = CONFIG.APP_PATH + '/admin/home/info/names/:type/:id/:slug?';
    /** The used skills; the selected one by name in the query parameter "name", the slug is only for reading (#212) */
    public static readonly ADMIN_INFO_USED_SKILLS = CONFIG.APP_PATH + '/admin/home/info/skills';
    public static readonly ADMIN_INFO_USED_SKILL = CONFIG.APP_PATH + '/admin/home/info/skills/:slug?';

    public static readonly USER_SPECIAL_LOGOUT = '##LOGOUT_USER##';

    public static readonly USER_BASE = CONFIG.APP_PATH + '/app/:initials';
    public static readonly PROFILE_SELECT = CONFIG.APP_PATH + '/profilauswahl';
    public static readonly USER_HOME = CONFIG.APP_PATH + '/app/:initials/home';
    /** The slug is only for reading, the ID selects (#182) */
    public static readonly USER_VIEW_PROFILE = CONFIG.APP_PATH + '/app/:initials/view/:id/:slug?';
    public static readonly USER_PROFILE = CONFIG.APP_PATH + '/app/:initials/profile';
    public static readonly USER_PROFILE_PROJECTS = CONFIG.APP_PATH + '/app/:initials/profile/projects';
    public static readonly USER_PROFILE_NEW_PROJECT = CONFIG.APP_PATH + '/app/:initials/profile/projects/new';
    public static readonly USER_PROFILE_PROJECT = CONFIG.APP_PATH + '/app/:initials/profile/projects/:projectId/:slug?';
    public static readonly USER_PROFILE_PROJECT_EDIT = CONFIG.APP_PATH + '/app/:initials/profile/projects/:projectId/:slug?/edit';
    public static readonly USER_PROFILE_SKILLS = CONFIG.APP_PATH + '/app/:initials/profile/skills';
    public static readonly USER_REPORTS = CONFIG.APP_PATH + '/app/:initials/reports';
    public static readonly USER_SEARCH = CONFIG.APP_PATH + '/app/:initials/search';
    public static readonly USER_STATISTICS_CLUSTERINFO = CONFIG.APP_PATH + '/app/:initials/statistics/clusterinfo';
    public static readonly USER_STATISTICS_SKILLS = CONFIG.APP_PATH + '/app/:initials/statistics/skills';

    /**
     * Readable part of a project URL (#182). A project named "Edit" has none, its URL would read as the edit mode.
     */
    public static projectSlug(name?: string): string {
        const slug = StringUtils.slug(name);
        return slug === 'edit' ? '' : slug;
    }

    public static viewProfile(initials: string, id: string, name?: string): string {
        return Paths.build(Paths.USER_VIEW_PROFILE, {initials, id, slug: StringUtils.slug(name)});
    }

    public static build(path: string, params: Record<string, string>): string {
        // An optional parameter without a value leaves no empty segment
        return path.replace(/\/:([a-zA-Z]+)(\?)?/g, (segment, key, optional) => {
            const value = params[key];
            if (optional && !value) {
                return '';
            }
            return value === undefined ? segment : '/' + value;
        }).replace(/\/$/, '');
    }
}
