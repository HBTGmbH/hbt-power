import {ActionType} from '../ActionType';
import {Paths} from '../../Paths';
import {Alerts} from '../../utils/Alerts';
import {CrossCuttingAsyncActionCreator} from '../crosscutting/CrossCuttingAsyncActionCreator';
import {AbstractAction} from '../BaseActions';
import {ThunkDispatch} from 'redux-thunk';

import {createBrowserHistory} from 'history';
import {confirmLeavingUnsavedChanges} from './UnsavedChanges';

type TransitionConfirmation = (message: string, callback: (ok: boolean) => void) => void;

let confirmTransition: TransitionConfirmation = (message, callback) => callback(true);

/**
 * Decides on a navigation that PWR_HISTORY.block held back (see registerUnsavedChangesGuard in index.tsx)
 */
export function setTransitionConfirmation(confirmation: TransitionConfirmation) {
  confirmTransition = confirmation;
}

export const PWR_HISTORY = createBrowserHistory({
  getUserConfirmation: (message, callback) => confirmTransition(message, callback)
});

export interface SetCurrentLocationAction extends AbstractAction {
  currentLocation: string;
}


export function success<T>(msg: string) {
  return (response: T) => {
    Alerts.showSuccess(msg);
    return response;
  };
}

export function navigate(to: string, dispatch: ThunkDispatch<any, any, any>): void {
  PWR_HISTORY.push(to);
  dispatch(NavigationActionCreator.SetCurrentLocation(to));
}

/**
 * Like navigate, but replaces the current history entry: for redirects, so going back doesn't land on them again
 */
export function navigateReplacing(to: string, dispatch: ThunkDispatch<any, any, any>): void {
  PWR_HISTORY.replace(to);
  dispatch(NavigationActionCreator.SetCurrentLocation(to));
}

export const NavigationActionCreator = {
  showSuccess: (msg: string) => Alerts.showSuccess(msg),
  success: (msg: string) => (response: any) => {
    Alerts.showSuccess(msg);
    return response;
  },
  SetCurrentLocation: (location: string): SetCurrentLocationAction => ({
    type: ActionType.SetCurrentLocation,
    currentLocation: location
  }),
  /**
   * Unsaved changes in a project are guarded by PWR_HISTORY.block, so every navigation asks first, not only this one
   */
  AsyncNavigateTo: (target: string) => {
    return function(dispatch: ThunkDispatch<any, any, any>) {
      if (target === Paths.USER_SPECIAL_LOGOUT) {
        // Logging out does more than navigate: ask before any of it happens
        dispatch(confirmLeavingUnsavedChanges(() => {
          navigate(Paths.APP_ROOT, dispatch);
          dispatch(CrossCuttingAsyncActionCreator.AsyncLogOutUser());
        }));
        return;
      }
      navigate(target, dispatch);
    };
  }

};
