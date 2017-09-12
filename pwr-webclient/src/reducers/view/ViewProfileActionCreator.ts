import * as redux from 'redux';
import {ViewProfileActions} from './ViewProfileActions';
import {ViewProfile} from '../../model/view/ViewProfile';
import {ActionType} from '../ActionType';
import {ApplicationState} from '../reducerIndex';
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {ViewProfileService} from '../../API_CONFIG';
import {ProfileActionCreator} from '../profile/ProfileActionCreator';
import {SortableEntryField, SortableEntryType} from '../../model/view/NameComparableType';

export namespace ViewProfileActionCreator {
    import SetViewProfileAction = ViewProfileActions.SetViewProfileAction;
    import RemoveViewProfileAction = ViewProfileActions.RemoveViewProfileAction;
    import patchMoveEntry = ViewProfileService.patchMoveEntry;
    import patchToggleEntry = ViewProfileService.patchToggleEntry;
    import SetSortInProgressAction = ViewProfileActions.SetSortInProgressAction;
    import patchSortEntry = ViewProfileService.patchSortEntry;

    /**
     * Constructs an action that sets a view profile into the store. If a view profile with the same ID exists, the
     * old one is replaced
     * @param viewProfile
     * @return the action
     */
    export function SetViewProfile(viewProfile: ViewProfile): SetViewProfileAction {
        return {
            type: ActionType.SetViewProfile,
            viewProfile: viewProfile
        }
    }

    export function RemoveViewProfile(id: string): RemoveViewProfileAction {
        return {
            type: ActionType.RemoveViewProfile,
            id: id
        }
    }

    export function SetSortInProgress(inProgress: boolean): SetSortInProgressAction {
        return {
            type: ActionType.SetSortInProgress,
            inProgress: inProgress
        }
    }

    function succeedAndRead(response: AxiosResponse, dispatch: redux.Dispatch<ApplicationState>) {
        let viewProfile: ViewProfile = new ViewProfile(response.data);
        dispatch(SetViewProfile(viewProfile));
        dispatch(ProfileActionCreator.SucceedAPIRequest());
    }

    export function AsyncCreateViewProfile(name: string, description: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let initials = getState().databaseReducer.loggedInUser().initials();
            let body = {
                name: name,
                viewDescription: description
            };
            axios.post(ViewProfileService.postViewProfile(initials), body).then((response: AxiosResponse) => {
                succeedAndRead(response, dispatch);
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                console.error(error);
            });
        }
    }

    export function AsyncMoveEntry(id: string, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let initials = getState().databaseReducer.loggedInUser().initials();
            dispatch(ProfileActionCreator.APIRequestPending());
            dispatch(SetSortInProgress(true));
            axios.patch(patchMoveEntry(initials, id, movableEntry, sourceIndex, targetIndex)).then((response: AxiosResponse) => {
                succeedAndRead(response, dispatch);
                dispatch(SetSortInProgress(false));
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                dispatch(SetSortInProgress(false));
                console.error(error);
            });
        }
    }

    export function AsyncToggleEntry(id: string, toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let initials = getState().databaseReducer.loggedInUser().initials();
            axios.patch(patchToggleEntry(initials, id, toggleableEntry, index, isEnabled)).then((response: AxiosResponse) => {
                succeedAndRead(response, dispatch);
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                console.error(error);
            });
        }
    }

    export function AsyncAutoSortEntry(id: string, entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let initials = getState().databaseReducer.loggedInUser().initials();
            let config: AxiosRequestConfig = {params: {"do-ascending": doAscending}};
            axios.patch(patchSortEntry(initials, id, entryType, field), null, config).then((response: AxiosResponse) => {
                succeedAndRead(response, dispatch);
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                console.error(error);
            });
        }
    }



    export function AsyncDeleteViewProfile(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let initials = getState().databaseReducer.loggedInUser().initials();
            axios.delete(ViewProfileService.deleteViewProfile(initials, id)).then(response => {
                dispatch(RemoveViewProfile(id));
                dispatch(ProfileActionCreator.SucceedAPIRequest());
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                console.error(error);
            });
        }
    }

    function AsyncLoadViewProfile(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let initials = getState().databaseReducer.loggedInUser().initials();
            axios.get(ViewProfileService.getViewProfile(initials, id)).then((response: AxiosResponse) => {
                succeedAndRead(response, dispatch);;
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                console.error(error);
            });
        }
    }



    /**
     * Loads all view profiles for the consultant that is currently logged in
     */
    export function AsyncLoadAllViewProfiles() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let initials = getState().databaseReducer.loggedInUser().initials();
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(ViewProfileService.getViewProfileIds(initials)).then((response: AxiosResponse) => {
                let ids: Array<string> = response.data;
                ids.forEach(id => dispatch(AsyncLoadViewProfile(id)));
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                console.error(error);
            });
        }
    }
}