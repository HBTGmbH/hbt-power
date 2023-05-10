import {CONFIG} from './Config';

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
    public static readonly ADMIN_STATISTICS_SKILL = CONFIG.APP_PATH + '/admin/home/statistics/skills';
    public static readonly ADMIN_STATISTICS_NETWORK = CONFIG.APP_PATH + '/admin/home/statistics/network';
    public static readonly ADMIN_INFO_SKILLTREE = CONFIG.APP_PATH + '/admin/home/info/skilltree';
    public static readonly ADMIN_INFO_NAME_ENTITY = CONFIG.APP_PATH + '/admin/home/info/names';

    public static readonly USER_SPECIAL_LOGOUT = '##LOGOUT_USER##';

    public static readonly USER_BASE = CONFIG.APP_PATH + '/app/';
    public static readonly PROFILE_SELECT = CONFIG.APP_PATH + '/profilauswahl';
    public static readonly USER_HOME = CONFIG.APP_PATH + '/app/home';
    public static readonly USER_VIEW_PROFILE = CONFIG.APP_PATH + '/app/view/:id';
    public static readonly USER_PROFILE = CONFIG.APP_PATH + '/app/profile';
    public static readonly USER_REPORTS = CONFIG.APP_PATH + '/app/reports';
    public static readonly USER_SEARCH = CONFIG.APP_PATH + '/app/search';
    public static readonly USER_STATISTICS_NETWORK = CONFIG.APP_PATH + '/app/statistics/network';
    public static readonly USER_STATISTICS_CLUSTERINFO = CONFIG.APP_PATH + '/app/statistics/clusterinfo';
    public static readonly USER_STATISTICS_SKILLS = CONFIG.APP_PATH + '/app/statistics/skills';

    constructor() {

    }
}
