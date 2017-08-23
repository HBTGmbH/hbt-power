import {
    COOKIE_ADMIN_PASSWORD,
    COOKIE_ADMIN_USERNAME,
    COOKIE_INITIALS_EXPIRATION_TIME,
    COOKIE_INITIALS_NAME
} from './model/PwrConstants';
import {isNullOrUndefined} from 'util';
import * as Cookies from 'js-cookie';
import {ProfileAsyncActionCreator} from './reducers/profile/ProfileAsyncActionCreator';
import {browserHistory} from 'react-router';
import {AdminActionCreator} from './reducers/admin/AdminActionCreator';
import {store} from './reducers/reducerIndex';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';

/**
 * Paths used for routing. Central point of configuration for routing information.
 */
export class Paths {
    public static readonly APP_ROOT = '/';
    public static readonly ADMIN_LOGIN = 'login';


    public static readonly ADMIN_BASE = '/admin/';
    public static readonly ADMIN_INBOX = '/admin/home/inbox';
    public static readonly ADMIN_TRASHBOX = '/admin/home/trashbox';
    public static readonly ADMIN_CONSULTANTS = '/admin/home/consultants';
    public static readonly ADMIN_STATISTICS_SKILL = '/admin/home/statistics/skills';
    public static readonly ADMIN_STATISTICS_NETWORK = '/admin/home/statistics/network';
    public static readonly ADMIN_INFO_SKILLTREE = '/admin/home/info/skilltree';
    public static readonly ADMIN_INFO_NAME_ENTITY = '/admin/home/info/names';

    public static readonly USER_SPECIAL_LOGOUT = '##LOGOUT_USER##';
    public static readonly USER_SPECIAL_LOGIN = '##LOGIN_USER##';

    public static readonly USER_BASE = '/app/';
    public static readonly USER_HOME = '/app/home';
    public static readonly USER_PROFILE = '/app/profile';
    public static readonly USER_VIEW = '/app/view/:id';
    public static readonly USER_VIEW_NO_ID = '/app/view/';
    public static readonly USER_REPORTS = '/app/reports';
    public static readonly USER_SEARCH = '/app/search';
    public static readonly USER_STATISTICS_NETWORK =  '/app/statistics/network';
    public static readonly USER_STATISTICS_CLUSTERINFO = '/app/statistics/clusterinfo';
    public static readonly USER_STATISTICS_SKILLS = '/app/statistics/skills';

    constructor() {

    }

    private userAvailableInCookies = () => {
        return !isNullOrUndefined(Cookies.get(COOKIE_INITIALS_NAME));
    };

    private adminAvailableInCookies = () => {
        return !isNullOrUndefined(Cookies.get(COOKIE_ADMIN_USERNAME)) && !isNullOrUndefined(Cookies.get(COOKIE_ADMIN_PASSWORD));
    };

    public restorePath() {
        let location = browserHistory.getCurrentLocation();
        console.info('Current history location is ', browserHistory.getCurrentLocation());
        if(this.adminAvailableInCookies()) {
            store.dispatch(AdminActionCreator.AsyncRestoreFromCookies());
        }else if(this.userAvailableInCookies()) {
            const storedInitials = Cookies.get(COOKIE_INITIALS_NAME);
            // renew the cookie to hold another fixed period of time.
            Cookies.set(COOKIE_INITIALS_NAME, storedInitials, {expires: COOKIE_INITIALS_EXPIRATION_TIME});
            store.dispatch(ProfileAsyncActionCreator.logInUser(storedInitials));
            store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.USER_HOME));
        } else {
            store.dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT));
        }
    }

}
