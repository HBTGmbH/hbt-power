import {COOKIE_ADMIN_PASSWORD, COOKIE_ADMIN_USERNAME, COOKIE_INITIALS_NAME} from './model/PwrConstants';
import {isNullOrUndefined} from 'util';
import {AdminActionCreator} from './reducers/admin/AdminActionCreator';
import {store} from './reducers/reducerIndex';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';
import {CONFIG} from './Config';
import {CrossCuttingAsyncActionCreator} from './reducers/crosscutting/CrossCuttingAsyncActionCreator';

declare const POWER_APP_PATH: string;

/**
 * Paths used for routing. Central point of configuration for routing information.
 */
export class Paths {
    public static readonly APP_ROOT = CONFIG.APP_PATH + '/';
    public static readonly ADMIN_LOGIN = CONFIG.APP_PATH + '/login';


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

    private userAvailableInCookies = () => {
        return !isNullOrUndefined(window.localStorage.getItem(COOKIE_INITIALS_NAME));
    };

    private adminAvailableInCookies = () => {
        return !isNullOrUndefined(window.localStorage.getItem(COOKIE_ADMIN_USERNAME)) && !isNullOrUndefined(window.localStorage.getItem(COOKIE_ADMIN_PASSWORD));
    };

    public restorePath() {
        console.info('Current history location is ', location.pathname);
        if (this.adminAvailableInCookies()) {
            console.info('Admin is available; Performing admin login!');
            store.dispatch(AdminActionCreator.AsyncRestoreFromLocalStorage());
        } else if (this.userAvailableInCookies()) {
            console.info('User restored from local storage');
            const storedInitials = window.localStorage.getItem(COOKIE_INITIALS_NAME);
            let path = location.pathname;
            // We can restore anything that is part of the user path
            // We might be on an admin path. If we are, we are going back to user root
            if (!path.startsWith(Paths.USER_BASE)) {
                console.log(`Requested path was '${path}', but '${path}' is not part of '${Paths.USER_BASE}'. Falling back to ${Paths.USER_HOME}`);
                path = Paths.USER_HOME;
            }
            store.dispatch(CrossCuttingAsyncActionCreator.AsyncLogInUser(storedInitials, path));
        } else {
            store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT));
        }
    }

}
