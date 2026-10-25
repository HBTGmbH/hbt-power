import * as redux from 'redux';
import {ViewProfile} from '../../model/view/ViewProfile';
import {ActionType} from '../ActionType';
import {ApplicationState} from '../reducerIndex';
import {AxiosRequestConfig} from 'axios';
import {SortableEntryField, SortableEntryType} from '../../model/view/NameComparableType';
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
import {saveInOrder} from '../../utils/SaveQueue';
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

    private static read(viewProfileResponse: ViewProfile, dispatch: redux.Dispatch) {
        dispatch(ViewProfileActionCreator.SetViewProfile(new ViewProfile(viewProfileResponse)));
    }

    /**
     * An edit on the view profile page, which saves right away (#149): one after the other per view profile (#320),
     * since the view-profile service reads and writes back the whole view profile for every change and answers with
     * it, so parallel changes could undo each other. Of several changes with the same key in a row only the last one
     * is sent; moves have none, each of them counts.
     */
    private static saveInOrder(viewProfileId: string, key: string | null, dispatch: redux.Dispatch,
                               send: () => Promise<ViewProfile>, onSettled?: () => void) {
        saveInOrder('view-profile/' + viewProfileId, key,
            () => send().then(response => ViewProfileActionCreator.read(response, dispatch)), onSettled);
    }

    public static AsyncCreateViewProfile(name: string, description: string, localization: string | null = null) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let body = {
                name: name,
                viewDescription: description,
                // Language of the skill and category names (#174)
                localization: localization
            };
            viewProfileClient.postViewProfile(initials, body)
                // It shows at the top of the list
                .then((viewProfile) => ViewProfileActionCreator.read(viewProfile, dispatch))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncCreateChangedViewProfile(initials: string, oldId: string, newName: string, newDescription: string, keepOld: boolean) {
        return function (dispatch: redux.Dispatch) {
            let body = {
                name: newName,
                viewDescription: newDescription,
                keepOld: keepOld
            };
            viewProfileClient.createChangedViewProfile(initials, oldId, body)
                .then(viewProfile => ViewProfileActionCreator.read(viewProfile, dispatch))
                // Not on the page of the old one, which stays open
                .then(() => Alerts.showSuccess(PowerLocalize.get('ViewProfile.Created')))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncMoveEntry(id: string, movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            // The indexes are those shown: no further move until this one is shown
            dispatch(ViewProfileActionCreator.SetSortInProgress(true));
            ViewProfileActionCreator.saveInOrder(id, null, dispatch,
                () => viewProfileClient.patchMoveEntry(initials, id, movableEntry, sourceIndex, targetIndex),
                () => dispatch(ViewProfileActionCreator.SetSortInProgress(false)));
        };
    }

    public static AsyncMoveNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                         movableEntry: string, sourceIndex: number, targetIndex: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            // The indexes are those shown: no further move until this one is shown
            dispatch(ViewProfileActionCreator.SetSortInProgress(true));
            ViewProfileActionCreator.saveInOrder(id, null, dispatch,
                () => viewProfileClient.patchMoveNestedEntry(initials, id, container, containerIndex, movableEntry, sourceIndex, targetIndex),
                () => dispatch(ViewProfileActionCreator.SetSortInProgress(false)));
        };
    }

    public static AsyncToggleNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number,
                                           toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            ViewProfileActionCreator.saveInOrder(id, 'visibility/' + container + '/' + containerIndex + '/' + toggleableEntry + '/' + index, dispatch,
                () => viewProfileClient.patchToggleNestedEntry(initials, id, container, containerIndex, toggleableEntry, index, isEnabled));
        };
    }

    public static AsyncToggleEntry(id: string, toggleableEntry: string, index: number, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            ViewProfileActionCreator.saveInOrder(id, 'visibility/' + toggleableEntry + '/' + index, dispatch,
                () => viewProfileClient.patchToggleEntry(initials, id, toggleableEntry, index, isEnabled));
        };
    }

    public static AsyncAutoSortEntry(id: string, entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            ViewProfileActionCreator.saveInOrder(id, 'order/' + entryType + '/' + field, dispatch,
                () => viewProfileClient.patchSortEntry(initials, id, entryType, field, config));
        };
    }

    public static AsyncToggleSkill(viewProfileId: string, skillName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName}};
            ViewProfileActionCreator.saveInOrder(viewProfileId, 'visibility/SKILL/' + skillName, dispatch,
                () => viewProfileClient.patchToggleSkill(initials, viewProfileId, isEnabled, config));
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
            ViewProfileActionCreator.saveInOrder(viewProfileId, 'display-category/' + skillName, dispatch,
                () => viewProfileClient.patchSetDisplayCategory(initials, viewProfileId, config));
        };
    }

    public static AsyncAutoSortNestedEntry(id: string, container: string, containerIndex: number,
                                             entryType: SortableEntryType, field: SortableEntryField, doAscending: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'do-ascending': doAscending}};
            ViewProfileActionCreator.saveInOrder(id, 'order/' + container + '/' + containerIndex + '/' + entryType + '/' + field, dispatch,
                () => viewProfileClient.patchSortNestedEntry(initials, id, container, containerIndex, entryType, field, config));
        };
    }


    /**
     * Asks first (DeferredActionMiddleware). The client shows a failure.
     */
    @makeDeferrable(ActionType.AsyncDeleteViewProfile)
    public static AsyncDeleteViewProfile(id: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            const initials = getState().profileStore.consultant.initials;
            viewProfileClient.deleteViewProfile(initials, id)
                .then(() => dispatch(ViewProfileActionCreator.RemoveViewProfile(id)))
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
                        ViewProfileActionCreator.read(response, dispatch);
                    }
                })
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncGenerateDocX(viewProfileId: string, templateId: string) {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.postReport(initials, viewProfileId, templateId)
                .then(() => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.build(Paths.USER_REPORTS, {initials}))))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    /** Name or note of the view profile, saved in the background from its page (#179) */
    public static AsyncSetInfo(viewProfileId: string, name: string, viewDescription: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            ViewProfileActionCreator.saveInOrder(viewProfileId, 'info', dispatch,
                () => viewProfileClient.patchInfo(initials, viewProfileId, name, viewDescription));
        };
    }

    /**
     * Loads all view profiles for the consultant that is currently logged in
     */
    public static AsyncLoadAllViewProfiles() {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            dispatch(ViewProfileActionCreator.ClearViewProfiles());
            viewProfileClient.getViewProfileIds(initials)
                // A late answer for a consultant no longer selected is dropped (#221)
                .then((response) => isCurrentConsultant(getState, initials)
                    && response.forEach(id => dispatch(ViewProfileActionCreator.AsyncLoadViewProfile(initials, id))))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncSetDescription(description: string, viewProfileId: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {headers: {'Content-Type': 'text/plain'}};
            ViewProfileActionCreator.saveInOrder(viewProfileId, 'description', dispatch,
                () => viewProfileClient.patchDescription(initials, viewProfileId, description, config));
        };
    }

    public static AsyncGetParentCategories(viewProfileId: string, skill: ViewSkill) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            viewProfileClient.getParentCategories(initials, viewProfileId, skill.name)
                .then((response) => dispatch(ViewProfileActionCreator.SetParentForSkill(response)))
                // The client shows the error
                .catch((error) => console.error(error));
        };
    }

    public static AsyncToggleVersion(id: string, skillName: string, versionName: string, isEnabled: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            let config: AxiosRequestConfig = {params: {'skill-name': skillName, 'version-name': versionName}};
            ViewProfileActionCreator.saveInOrder(id, 'visibility/version/' + skillName + '/' + versionName, dispatch,
                () => viewProfileClient.patchToggleVersion(initials, id, skillName, versionName, isEnabled, config));
        };
    }

    public static AsyncMoveAllSkills(id: string, displayCategoryIndex: number, targetId: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            ViewProfileActionCreator.saveInOrder(id, null, dispatch,
                () => viewProfileClient.patchMoveAllSkills(initials, id, displayCategoryIndex, targetId));
        };
    }

    public static AsyncSetShowSkillVersions(id: string, show: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            ViewProfileActionCreator.saveInOrder(id, 'show-versions', dispatch,
                () => viewProfileClient.patchShowSkillVersions(initials, id, show));
        };
    }

    public static AsyncSetLocalization(id: string, language: string | null) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let initials = getState().profileStore.consultant.initials;
            ViewProfileActionCreator.saveInOrder(id, 'localization', dispatch,
                () => viewProfileClient.patchLocalization(initials, id, language));
        };
    }
}
