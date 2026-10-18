import {ActionType} from '../ActionType';
import {ApplicationState} from '../reducerIndex';
import {Paths} from '../../Paths';
import {storeHasUnsavedChanges} from '../../utils/PwrStoreUtils';
import {Alerts} from '../../utils/Alerts';
import {CrossCuttingAsyncActionCreator} from '../crosscutting/CrossCuttingAsyncActionCreator';
import {AbstractAction} from '../BaseActions';
import {ThunkDispatch} from 'redux-thunk';

import {createBrowserHistory} from 'history';
import {matchPath} from 'react-router-dom';
import {discardProjectChangesAction} from '../profile-new/profile/actions/ProjectActions';

export const PWR_HISTORY = createBrowserHistory();

export interface SetNavigationTargetAction extends AbstractAction {
  target: string;
}

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

export const NavigationActionCreator = {
  showSuccess: (msg: string) => Alerts.showSuccess(msg),
  success: (msg: string) => (response: any) => {
    Alerts.showSuccess(msg);
    return response;
  },
  SetNavigationTarget: (target: string): SetNavigationTargetAction => ({
    type: ActionType.SetNavigationTarget,
    target: target
  }),
  SetCurrentLocation: (location: string): SetCurrentLocationAction => ({
    type: ActionType.SetCurrentLocation,
    currentLocation: location
  }),
  DropNavigationTarget: (): AbstractAction => ({type: ActionType.DropNavigationTarget}),
  AsyncNavigateTo: (target: string) => {
    return function(dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
      const hasChanges = storeHasUnsavedChanges(getState());
      if (target === Paths.USER_SPECIAL_LOGOUT) {
        if (hasChanges) {
          dispatch(NavigationActionCreator.SetNavigationTarget(target));
        } else {
          navigate(Paths.APP_ROOT, dispatch);
          dispatch(CrossCuttingAsyncActionCreator.AsyncLogOutUser());
        }
        return;
      }
      // Unsaved changes only exist in the profile (projects); ask before leaving it
      const leavesProfile = !!matchPath(PWR_HISTORY.location.pathname, {path: Paths.USER_PROFILE})
          && !matchPath(target, {path: Paths.USER_PROFILE});
      if (hasChanges && leavesProfile) {
        dispatch(NavigationActionCreator.SetNavigationTarget(target));
      } else {
        navigate(target, dispatch);
      }
    };
  },
  AsyncContinueToTarget: () => {
    return function(dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
      let target: string = getState().navigationSlice.targetLocation;
      // The user decided to leave anyway: close the dialog and drop the unsaved changes, so they do not come up again
      dispatch(NavigationActionCreator.DropNavigationTarget());
      dispatch(discardProjectChangesAction());
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

};
