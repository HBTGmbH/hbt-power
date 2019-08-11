import {ActionType} from '../ActionType';
import * as redux from 'redux';
import {ApplicationState, PWR_HISTORY} from '../reducerIndex';
import {Paths} from '../../Paths';
import {storeHasUnsavedChanges} from '../../utils/PwrStoreUtils';
import {Alerts} from '../../utils/Alerts';
import {CrossCuttingAsyncActionCreator} from '../crosscutting/CrossCuttingAsyncActionCreator';
import {AbstractAction} from '../BaseActions';

export interface SetNavigationTargetAction extends AbstractAction {
    target: string;
}

export interface SetCurrentLocationAction extends AbstractAction {
    currentLocation: string;
}


export namespace NavigationActionCreator {


    export function showSuccess(msg: string) {
        Alerts.showSuccess(msg);
    }

    export function success<T>(msg: string) {
        return (response: T) => {
            Alerts.showSuccess(msg);
            return response;
        }
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
                    dispatch(CrossCuttingAsyncActionCreator.AsyncLogOutUser());
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
                    dispatch(CrossCuttingAsyncActionCreator.AsyncLogOutUser());
                    break;
                }
                default:
                    navigate(target, dispatch);
                    break;
            }
        };
    }


}
