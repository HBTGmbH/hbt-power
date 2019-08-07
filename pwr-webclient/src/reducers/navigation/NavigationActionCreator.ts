import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import * as redux from 'redux';
import {ApplicationState, PWR_HISTORY} from '../reducerIndex';
import {Paths} from '../../Paths';
import {ProfileActionCreator} from '../profile/ProfileActionCreator';
import {COOKIE_INITIALS_NAME} from '../../model/PwrConstants';
import * as Cookies from 'js-cookie';
import {ViewProfileActionCreator} from '../view/ViewProfileActionCreator';
import {storeHasUnsavedChanges} from '../../utils/PwrStoreUtils';

export interface SetNavigationTargetAction extends AbstractAction {
    target: string;
}

export interface SetCurrentLocationAction extends AbstractAction {
    currentLocation: string;
}

export namespace NavigationActionCreator {

    let alertContainer: any = null;

    export function setAlertContainer(container: any) {
        console.log('Init Container', container);
        alertContainer = container;
    }

    export function showError(msg: string) {
        alertContainer.show(msg, {
            time: 0,
            type: 'error',
        });
    }

    export function showSuccess(msg: string) {
        alertContainer.show(msg, {
            time: 10000,
            type: 'success',
        });
    }

    /**
     * Sets the navigation target for an intercepted navigation action.
     * Continue or drop are possible when a target is set.
     * @param target
     * @returns {{type: ActionType, target: string}}
     * @constructor
     */
    function SetNavigationTarget(target: string): SetNavigationTargetAction {
        return {
            type: ActionType.SetNavigationTarget,
            target: target
        };
    }

    function SetCurrentLocation(location: string): SetCurrentLocationAction {
        return {
            type: ActionType.SetCurrentLocation,
            currentLocation: location
        };
    }

    export function DropNavigationTarget(): AbstractAction {
        return {
            type: ActionType.DropNavigationTarget
        };
    }


    function navigate(to: string, dispatch: redux.Dispatch<ApplicationState>): void {
        console.debug('Navigating to ' + to);
        PWR_HISTORY.push(to);
        dispatch(SetCurrentLocation(to));
    }

    /**
     * Invokes async navigation to the given target; performs all necessary side effects.
     * @param target
     * @constructor
     */
    export function AsyncNavigateTo(target: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let state: ApplicationState = getState();
            let currentLocation = state.navigationSlice.currentLocation();
            const hasChanges = storeHasUnsavedChanges(getState());
            if (target === Paths.USER_SPECIAL_LOGOUT) {
                if (hasChanges) {
                    dispatch(SetNavigationTarget(target));
                } else {
                    navigate(Paths.APP_ROOT, dispatch);
                    Cookies.remove(COOKIE_INITIALS_NAME);
                    dispatch(ProfileActionCreator.logOutUser());
                    dispatch(ViewProfileActionCreator.ResetViewState());
                }
            }
            if (currentLocation === Paths.USER_PROFILE && target !== Paths.USER_PROFILE && hasChanges) {
                dispatch(SetNavigationTarget(target));
            } else {
                navigate(target, dispatch);
            }
        };
    }

    export function AsyncContinueToTarget() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let target: string = getState().navigationSlice.targetLocation();
            switch (target) {
                case Paths.USER_SPECIAL_LOGOUT: {
                    navigate(Paths.APP_ROOT, dispatch);
                    Cookies.remove(COOKIE_INITIALS_NAME);
                    dispatch(ProfileActionCreator.logOutUser());
                    dispatch(ViewProfileActionCreator.ResetViewState());
                    break;
                }
                default:
                    navigate(target, dispatch);
                    break;
            }
        };
    }


}
