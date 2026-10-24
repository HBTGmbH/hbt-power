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
import {makeDeferrable} from '../deferred/AsyncActionUnWrapper';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {RemoveViewProfileAction, SetParentCategoryAction, SetSortInProgressAction, SetViewProfileAction} from './ViewProfileActions';

const viewProfileClient = ViewProfileServiceClient.instance();

/** Whether the consultant is still the selected one when an answer for them arrives */
const isCurrentConsultant = (getState: () => ApplicationState, initials: string) =>
    getState().profileStore.consultant.initials === initials;

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
        ViewProfileActionCreator.read(viewProfileResponse, dispatch);
        dispatch(CrossCuttingActionCreator.endRequest());
    }

    /**
     * The state after an edit saved in the background (#149, PowerHttpClient.patchInBackground): no loading overlay
     * to end
     */
    private static read(viewProfileResponse: ViewProfile, dispatch: redux.Dispatch) {
        dispatch(ViewProfileActionCreator.SetViewProfile(new ViewProfile(viewProfileResponse)));
    }

    public static AsyncCreateViewProfile(name: string, description: string, localization: string | null = null) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            let initials = getState().profileStore.consultant.initials;
            let body = {
                name: name,
                viewDescription: description,
                // Language of the skill and category names (#174)
                localization: localization
            };
            viewProfileClient.postViewProfile(initials, body)
                .then((viewProfile) => ViewProfileActionCreator.succeedAndRead(viewProfile, dispatch))
                .then(() => Alerts.showSuccess(PowerLocalize.get('ViewProfile.Created')))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError(PowerLocalize.get('ViewProfile.Error.Create')));
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
                .then(() => Alerts.showSuccess(PowerLocalize.get('ViewProfile.Created')))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError(PowerLocalize.get('ViewProfile.Error.Create')));
        };
    }

    public static AsyncMoveEntry(id: string, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(ViewProfileActionCreator.SetSortInProgress(true));
            viewProfileClient.patchMoveEntry(initials, id, movableEntry, sourceIndex, targetIndex)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error; the page must not stay blocked
                .catch((error) => console.error(error))
                .finally(() => dispatch(ViewProfileActionCreator.SetSortInProgress(false)));
        };
    }

    public static AsyncMoveNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                         movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(ViewProfileActionCreator.SetSortInProgress(true));
            viewProfileClient.patchMoveNestedEntry(initials, id, container, containerIndex, movableEntry, sourceIndex, targetIndex)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error; the page must not stay blocked
                .catch((error) => console.error(error))
                .finally(() => dispatch(ViewProfileActionCreator.SetSortInProgress(false)));
        };
    }

    public static AsyncToggleNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                           toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchToggleNestedEntry(initials, id, container, containerIndex, toggleableEntry, index, isEnabled)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncToggleEntry(id: string, toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchToggleEntry(initials, id, toggleableEntry, index, isEnabled)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncAutoSortEntry(id: string, entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            viewProfileClient.patchSortEntry(initials, id, entryType, field, config)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncToggleSkill(viewProfileId: string, skillName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName}};
            viewProfileClient.patchToggleSkill(initials, viewProfileId, isEnabled, config)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncSetDisplayCategory(viewProfileId: string, skillName: string, newDisplayCategoryName: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {
                params: {
                    'skill-name': skillName,
                    'display-category': newDisplayCategoryName
                }
            };
            viewProfileClient.patchSetDisplayCategory(initials, viewProfileId, config)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncAutoSortNestedEntry(id: string, container: string, containerIndex: number,
                                             entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            viewProfileClient.patchSortNestedEntry(initials, id, container, containerIndex, entryType, field, config)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }


    /**
     * Asks first (DeferredActionMiddleware). The client runs the loading indicator and shows a failure.
     */
    @makeDeferrable(ActionType.AsyncDeleteViewProfile)
    public static AsyncDeleteViewProfile(id: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            const initials = getState().profileStore.consultant.initials;
            viewProfileClient.deleteViewProfile(initials, id)
                .then(() => {
                    dispatch(ViewProfileActionCreator.RemoveViewProfile(id));
                    Alerts.showSuccess(PowerLocalize.get('ViewProfile.Deleted'));
                })
                .catch((error) => console.error(error));
        };
    }

    /**
     * With the initials its id was loaded for (#221): after a switch to another consultant the store holds the new ones
     */
    private static AsyncLoadViewProfile(initials: string, id: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            viewProfileClient.getViewProfile(initials, id)
                .then((response) => {
                    if (isCurrentConsultant(getState, initials)) {
                        ViewProfileActionCreator.succeedAndRead(response, dispatch);
                    }
                })
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError(PowerLocalize.get('ViewProfile.Error.Load')));
        };
    }

    public static AsyncGenerateDocX(viewProfileId: string, templateId: string) {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(CrossCuttingActionCreator.startRequest());
            viewProfileClient.postReport(initials, viewProfileId, templateId)
                .then(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .then(() => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.build(Paths.USER_REPORTS, {initials}))))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError(PowerLocalize.get('ViewProfile.Error.Generate')));
        };
    }

    /** Name or note of the view profile, saved in the background from its page (#179) */
    public static AsyncSetInfo(viewProfileId: string, name: string, viewDescription: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchInfo(initials, viewProfileId, name, viewDescription)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
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
                // A late answer for a consultant no longer selected is dropped (#221)
                .then((response) => isCurrentConsultant(getState, initials)
                    && response.forEach(id => dispatch(ViewProfileActionCreator.AsyncLoadViewProfile(initials, id))))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError(PowerLocalize.get('ViewProfile.Error.LoadAll')));
        };
    }

    public static AsyncSetDescription(description: string, viewProfileId: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {headers: {'Content-Type': 'text/plain'}};
            viewProfileClient.patchDescription(initials, viewProfileId, description, config)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncGetParentCategories(viewProfileId: string, skill: ViewSkill) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.getParentCategories(initials, viewProfileId, skill.name)
                .then((response) => dispatch(ViewProfileActionCreator.SetParentForSkill(response)))
                .catch((error) => console.error(error))
                .catch(() => dispatch(CrossCuttingActionCreator.endRequest()))
                .catch(() => Alerts.showError(PowerLocalize.getFormatted('ViewProfile.Error.SkillParents', skill.name)));
        };
    }

    public static AsyncToggleVersion(id: string, skillName: string, versionName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName, 'version-name': versionName}};
            viewProfileClient.patchToggleVersion(initials, id, skillName, versionName, isEnabled, config)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncMoveAllSkills(id: string, displayCategoryIndex: number, targetId: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchMoveAllSkills(initials, id, displayCategoryIndex, targetId)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncSetShowSkillVersions(id: string, show: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchShowSkillVersions(initials, id, show)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncSetLocalization(id: string, language: string | null) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.patchLocalization(initials, id, language)
                .then((response) => ViewProfileActionCreator.read(response, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }
}
