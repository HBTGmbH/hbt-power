import * as redux from 'redux';
import {ViewProfileActions} from './ViewProfileActions';
import {ViewProfile} from '../../model/view/ViewProfile';
import {ActionType} from '../ActionType';
import {ApplicationState} from '../reducerIndex';
import {AxiosRequestConfig} from 'axios';
import {SortableEntryField, SortableEntryType} from '../../model/view/NameComparableType';
import {CrossCuttingActionCreator} from '../crosscutting/CrossCuttingActionCreator';
import {Alerts} from '../../utils/Alerts';
import {AbstractAction} from '../BaseActions';
import {ViewSkill} from '../../model/view/ViewSkill';
import {ViewCategory} from '../../model/view/ViewCategory';
import {NavigationActionCreator} from '../navigation/NavigationActionCreator';
import {Paths} from '../../Paths';
import {ViewProfileServiceClient} from '../../clients/ViewProfileServiceClient';
import {ThunkDispatch} from 'redux-thunk';

const viewProfileClient = ViewProfileServiceClient.instance();
export namespace ViewProfileActionCreator {
    import SetViewProfileAction = ViewProfileActions.SetViewProfileAction;
    import RemoveViewProfileAction = ViewProfileActions.RemoveViewProfileAction;
    import SetSortInProgressAction = ViewProfileActions.SetSortInProgressAction;
    import SetParentCategoryAction = ViewProfileActions.SetParentCategoryAction;

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
        };
    }

    export function ClearViewProfiles(): AbstractAction {
        return {
            type: ActionType.ClearViewProfiles
        };
    }

    export function ResetViewState(): AbstractAction {
        return {
            type: ActionType.ResetViewState
        };
    }

    export function RemoveViewProfile(id: string): RemoveViewProfileAction {
        return {
            type: ActionType.RemoveViewProfile,
            id: id
        };
    }

    export function SetSortInProgress(inProgress: boolean): SetSortInProgressAction {
        return {
            type: ActionType.SetSortInProgress,
            inProgress: inProgress
        };
    }

    export function SetParentForSkill(categoryMap: Map<number, ViewCategory>): SetParentCategoryAction {
        return {
            type: ActionType.SetParentCategories,
            categoryMap: categoryMap
        };
    }

    function succeedAndRead(viewProfileResponse: ViewProfile, dispatch: redux.Dispatch) {
        let viewProfile: ViewProfile = new ViewProfile(viewProfileResponse);
        dispatch(SetViewProfile(viewProfile));
        dispatch(CrossCuttingActionCreator.endRequest());
    }

    export function AsyncCreateViewProfile(name: string, description: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let body = {
                name: name,
                viewDescription: description
            };
            viewProfileClient.postViewProfile(initials, body)
                .then((viewProfile) => succeedAndRead(viewProfile, dispatch))
                .then(() => Alerts.showSuccess('View Profile created.'))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not create view profile!'));
        };
    }

    export function AsyncCreateChangedViewProfile(initials: string, oldId: string, newName: string, newDescription: string, keepOld: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let body = {
                name: newName,
                viewDescription: newDescription,
                keepOld: keepOld
            };
            viewProfileClient.createChangedViewProfile(initials, oldId, body)
                .then(viewProfile => succeedAndRead(viewProfile, dispatch))
                .then(() => Alerts.showSuccess('View Profile created.'))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not create view profile!'));
        };
    }

    export function AsyncMoveEntry(id: string, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(SetSortInProgress(true));
            viewProfileClient.patchMoveEntry(initials, id, movableEntry, sourceIndex, targetIndex)
                .then((response) => succeedAndRead(response, dispatch))
                .then(() => dispatch(SetSortInProgress(false)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not move entry'));
        };
    }

    export function AsyncMoveNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                         movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(SetSortInProgress(true));
            viewProfileClient.patchMoveNestedEntry(initials, id, container, containerIndex, movableEntry, sourceIndex, targetIndex)
                .then((response) => succeedAndRead(response, dispatch))
                .then(() => dispatch(SetSortInProgress(false)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not move entries!'));
        };
    }

    export function AsyncToggleNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                           toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchToggleNestedEntry(initials, id, container, containerIndex, toggleableEntry, index, isEnabled)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not toggle entry!'));
        };
    }

    export function AsyncToggleEntry(id: string, toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchToggleEntry(initials, id, toggleableEntry, index, isEnabled)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not toggle entry!'));
        };
    }

    export function AsyncAutoSortEntry(id: string, entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            viewProfileClient.patchSortEntry(initials, id, entryType, field, config)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not sort entry!'));
        };
    }

    export function AsyncToggleSkill(viewProfileId: string, skillName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName}};
            viewProfileClient.patchToggleSkill(initials, viewProfileId, isEnabled, config)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not toggle skill!'));
        };
    }

    export function AsyncSetDisplayCategory(viewProfileId: string, skillName: string, newDisplayCategoryName: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {
                params: {
                    'skill-name': skillName,
                    'display-category': newDisplayCategoryName
                }
            };
            viewProfileClient.patchSetDisplayCategory(initials, viewProfileId, config)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not set display category!'));
        };
    }

    export function AsyncAutoSortNestedEntry(id: string, container: string, containerIndex: number,
                                             entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            viewProfileClient.patchSortNestedEntry(initials, id, container, containerIndex, entryType, field, config)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not sort view profile!'));
        };
    }


    export function AsyncDeleteViewProfile(id: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.deleteViewProfile(initials, id)
                .then(() => dispatch(RemoveViewProfile(id)))
                .then(() => Alerts.showSuccess('View profile deleted!'))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not delete view profile!'));
        };
    }

    function AsyncLoadViewProfile(id: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.getViewProfile(initials, id)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not load view profile!'));
        };
    }

    export function AsyncGenerateDocX(viewProfileId: string, templateId: string) {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            viewProfileClient.postReport(initials, viewProfileId, templateId)
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .then(() => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.USER_REPORTS)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not generate document!'));
        };
    }

    export function AsyncUpdateViewProfile(viewProfileId: string, description: string, name: string, charsPerLine: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let data = {
                viewDescription: description,
                name: name,
                charsPerLine: charsPerLine
            };
            dispatch(CrossCuttingActionCreator.startRequest());
            viewProfileClient.patchPartialUpdate(initials, viewProfileId, data)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not update view profiles!'));
        };
    }

    /**
     * Loads all view profiles for the consultant that is currently logged in
     */
    export function AsyncLoadAllViewProfiles() {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(ClearViewProfiles());
            dispatch(CrossCuttingActionCreator.startRequest());
            viewProfileClient.getViewProfileIds(initials)
                .then((response) => response.forEach(id => dispatch(AsyncLoadViewProfile(id))))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not load view profiles!'));
        };
    }

    export function AsyncSetDescription(description: string, viewProfileId: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            let config: AxiosRequestConfig = {headers: {'Content-Type': 'text/plain'}};
            viewProfileClient.patchDescription(initials, viewProfileId, description, config)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not set description!'));
        };
    }

    export function AsyncGetParentCategories(skill: ViewSkill) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            viewProfileClient.getParentCategories(skill.name)
                .then((response) => dispatch(SetParentForSkill(response)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not get parents for skill: ' + skill.name + '!'));
        };
    }

    export function AsyncToggleVersion(id: string, skillName: string, versionName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName, 'version-name': versionName}};
            viewProfileClient.patchToggleVersion(initials, id, skillName, versionName, isEnabled, config)
                .then((response) => succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not change enable!'));
        };
    }
}
