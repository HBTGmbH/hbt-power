import * as redux from 'redux';
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
import {RemoveViewProfileAction, SetParentCategoryAction, SetSortInProgressAction, SetViewProfileAction} from './ViewProfileActions';

const viewProfileClient = ViewProfileServiceClient.instance();
export class ViewProfileActionCreator {

    /**
     * Constructs an action that sets a view profile into the store. If a view profile with the same ID exists, the
     * old one is replaced
     * @param viewProfile
     * @return the action
     */
    public static SetViewProfile(viewProfile: ViewProfile): SetViewProfileAction {
        return {
            type: ActionType.SetViewProfile,
            viewProfile: viewProfile
        };
    }

    public static ClearViewProfiles(): AbstractAction {
        return {
            type: ActionType.ClearViewProfiles
        };
    }

    public static ResetViewState(): AbstractAction {
        return {
            type: ActionType.ResetViewState
        };
    }

    public static RemoveViewProfile(id: string): RemoveViewProfileAction {
        return {
            type: ActionType.RemoveViewProfile,
            id: id
        };
    }

    public static SetSortInProgress(inProgress: boolean): SetSortInProgressAction {
        return {
            type: ActionType.SetSortInProgress,
            inProgress: inProgress
        };
    }

    public static SetParentForSkill(categoryMap: Map<number, ViewCategory>): SetParentCategoryAction {
        return {
            type: ActionType.SetParentCategories,
            categoryMap: categoryMap
        };
    }

    private static succeedAndRead(viewProfileResponse: ViewProfile, dispatch: redux.Dispatch) {
        let viewProfile: ViewProfile = new ViewProfile(viewProfileResponse);
        dispatch(ViewProfileActionCreator.SetViewProfile(viewProfile));
        dispatch(CrossCuttingActionCreator.endRequest());
    }

    public static AsyncCreateViewProfile(name: string, description: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let body = {
                name: name,
                viewDescription: description
            };
            viewProfileClient.postViewProfile(initials, body)
                .then((viewProfile) => ViewProfileActionCreator.succeedAndRead(viewProfile, dispatch))
                .then(() => Alerts.showSuccess('View Profile created.'))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not create view profile!'));
        };
    }

    public static AsyncCreateChangedViewProfile(initials: string, oldId: string, newName: string, newDescription: string, keepOld: boolean) {
        return function (dispatch: redux.Dispatch) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let body = {
                name: newName,
                viewDescription: newDescription,
                keepOld: keepOld
            };
            viewProfileClient.createChangedViewProfile(initials, oldId, body)
                .then(viewProfile => ViewProfileActionCreator.succeedAndRead(viewProfile, dispatch))
                .then(() => Alerts.showSuccess('View Profile created.'))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not create view profile!'));
        };
    }

    public static AsyncMoveEntry(id: string, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(ViewProfileActionCreator.SetSortInProgress(true));
            viewProfileClient.patchMoveEntry(initials, id, movableEntry, sourceIndex, targetIndex)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .then(() => dispatch(ViewProfileActionCreator.SetSortInProgress(false)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not move entry'));
        };
    }

    public static AsyncMoveNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                         movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(ViewProfileActionCreator.SetSortInProgress(true));
            viewProfileClient.patchMoveNestedEntry(initials, id, container, containerIndex, movableEntry, sourceIndex, targetIndex)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .then(() => dispatch(ViewProfileActionCreator.SetSortInProgress(false)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not move entries!'));
        };
    }

    public static AsyncToggleNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                           toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchToggleNestedEntry(initials, id, container, containerIndex, toggleableEntry, index, isEnabled)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not toggle entry!'));
        };
    }

    public static AsyncToggleEntry(id: string, toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchToggleEntry(initials, id, toggleableEntry, index, isEnabled)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not toggle entry!'));
        };
    }

    public static AsyncAutoSortEntry(id: string, entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            viewProfileClient.patchSortEntry(initials, id, entryType, field, config)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not sort entry!'));
        };
    }

    public static AsyncToggleSkill(viewProfileId: string, skillName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName}};
            viewProfileClient.patchToggleSkill(initials, viewProfileId, isEnabled, config)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not toggle skill!'));
        };
    }

    public static AsyncSetDisplayCategory(viewProfileId: string, skillName: string, newDisplayCategoryName: string) {
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
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not set display category!'));
        };
    }

    public static AsyncAutoSortNestedEntry(id: string, container: string, containerIndex: number,
                                             entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            viewProfileClient.patchSortNestedEntry(initials, id, container, containerIndex, entryType, field, config)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not sort view profile!'));
        };
    }


    public static AsyncDeleteViewProfile(id: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.deleteViewProfile(initials, id)
                .then(() => dispatch(ViewProfileActionCreator.RemoveViewProfile(id)))
                .then(() => Alerts.showSuccess('View profile deleted!'))
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not delete view profile!'));
        };
    }

    private static AsyncLoadViewProfile(id: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.getViewProfile(initials, id)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not load view profile!'));
        };
    }

    public static AsyncGenerateDocX(viewProfileId: string, templateId: string) {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            viewProfileClient.postReport(initials, viewProfileId, templateId)
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))
                // FIXME@nt fill initials!
                .then(() => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.USER_REPORTS)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not generate document!'));
        };
    }

    public static AsyncUpdateViewProfile(viewProfileId: string, description: string, name: string, charsPerLine: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let data = {
                viewDescription: description,
                name: name,
                charsPerLine: charsPerLine
            };
            dispatch(CrossCuttingActionCreator.startRequest());
            viewProfileClient.patchPartialUpdate(initials, viewProfileId, data)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not update view profiles!'));
        };
    }

    /**
     * Loads all view profiles for the consultant that is currently logged in
     */
    public static AsyncLoadAllViewProfiles() {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(ViewProfileActionCreator.ClearViewProfiles());
            dispatch(CrossCuttingActionCreator.startRequest());
            viewProfileClient.getViewProfileIds(initials)
                .then((response) => response.forEach(id => dispatch(ViewProfileActionCreator.AsyncLoadViewProfile(id))))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not load view profiles!'));
        };
    }

    public static AsyncSetDescription(description: string, viewProfileId: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            let config: AxiosRequestConfig = {headers: {'Content-Type': 'text/plain'}};
            viewProfileClient.patchDescription(initials, viewProfileId, description, config)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not set description!'));
        };
    }

    public static AsyncGetParentCategories(skill: ViewSkill) {
        return function (dispatch: redux.Dispatch) {
            viewProfileClient.getParentCategories(skill.name)
                .then((response) => dispatch(ViewProfileActionCreator.SetParentForSkill(response)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not get parents for skill: ' + skill.name + '!'));
        };
    }

    public static AsyncToggleVersion(id: string, skillName: string, versionName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName, 'version-name': versionName}};
            viewProfileClient.patchToggleVersion(initials, id, skillName, versionName, isEnabled, config)
                .then((response) => ViewProfileActionCreator.succeedAndRead(response, dispatch))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError('Could not change enable!'));
        };
    }
}
