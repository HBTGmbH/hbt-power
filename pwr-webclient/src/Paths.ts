import {
    COOKIE_ADMIN_PASSWORD,
    COOKIE_ADMIN_USERNAME,
    COOKIE_INITIALS_EXPIRATION_TIME,
    COOKIE_INITIALS_NAME
} from './model/PwrConstants';
import {isNullOrUndefined} from 'util';
import * as Cookies from 'js-cookie';
import {ProfileAsyncActionCreator} from './reducers/profile/ProfileAsyncActionCreator';
import {AdminActionCreator} from './reducers/admin/AdminActionCreator';
import {store} from './reducers/reducerIndex';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';

/**
 * Paths used for routing. Central point of configuration for routing information.
 */
export class Paths {
    public static readonly APP_ROOT = '/power/';
    public static readonly ADMIN_LOGIN = '/power/login';


    public static readonly ADMIN_BASE = '/power/admin/';
    public static readonly ADMIN_INBOX = '/power/admin/home/inbox';
    public static readonly ADMIN_TRASHBOX = '/power/admin/home/trashbox';
    public static readonly ADMIN_CONSULTANTS = '/power/admin/home/consultants';
    public static readonly ADMIN_STATISTICS_SKILL = '/power/admin/home/statistics/skills';
    public static readonly ADMIN_STATISTICS_NETWORK = '/power/admin/home/statistics/network';
    public static readonly ADMIN_INFO_SKILLTREE = '/power/admin/home/info/skilltree';
    public static readonly ADMIN_INFO_NAME_ENTITY = '/power/admin/home/info/names';

    public static readonly USER_SPECIAL_LOGOUT = '##LOGOUT_USER##';

    public static readonly USER_BASE = '/power/app/';
    public static readonly USER_HOME = '/power/app/home';
    public static readonly USER_VIEW_PROFILE = '/power/app/view/:id';
    public static readonly USER_PROFILE = '/power/app/profile';
    public static readonly USER_REPORTS = '/power/app/reports';
    public static readonly USER_SEARCH = '/power/app/search';
    public static readonly USER_STATISTICS_NETWORK =  '/power/app/statistics/network';
    public static readonly USER_STATISTICS_CLUSTERINFO = '/power/app/statistics/clusterinfo';
    public static readonly USER_STATISTICS_SKILLS = '/power/app/statistics/skills';

    constructor() {

    }

    private userAvailableInCookies = () => {
        return !isNullOrUndefined(Cookies.get(COOKIE_INITIALS_NAME));
    };

    private adminAvailableInCookies = () => {
        return !isNullOrUndefined(Cookies.get(COOKIE_ADMIN_USERNAME)) && !isNullOrUndefined(Cookies.get(COOKIE_ADMIN_PASSWORD));
    };

    public restorePath() {
        console.info('Current history location is ',location.pathname );
        if (this.adminAvailableInCookies()) {
            store.dispatch(AdminActionCreator.AsyncRestoreFromCookies());
        } else if(this.userAvailableInCookies()) {
            const storedInitials = Cookies.get(COOKIE_INITIALS_NAME);
            // renew the cookie to hold another fixed period of time.
            Cookies.set(COOKIE_INITIALS_NAME, storedInitials, {expires: COOKIE_INITIALS_EXPIRATION_TIME});
            if(location.pathname !== Paths.APP_ROOT) {
                store.dispatch(ProfileAsyncActionCreator.logInUser(storedInitials, location.pathname));
            } else {
                store.dispatch(ProfileAsyncActionCreator.logInUser(storedInitials, Paths.USER_HOME));
            }
        } else {
            store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT));
        }
    }

}
