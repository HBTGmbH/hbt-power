import {APISkillCategory, SkillCategory} from '../../model/skill/SkillCategory';
import {SkillActions} from './SkillActions';
import {ActionType} from '../ActionType';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {RequestStatus} from '../../Store';
import {AxiosError, AxiosResponse} from 'axios';
import {APISkillServiceSkill, SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {isNullOrUndefined} from 'util';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
import {AdminActionCreator} from '../admin/AdminActionCreator';
import {SkillServiceError} from '../../model/skill/SkillServiceError';
import {TCategoryNode} from '../../model/skill/tree/TCategoryNode';
import {Alerts} from '../../utils/Alerts';
import {AbstractAction, ChangeNumberValueAction, ChangeStringValueAction} from '../BaseActions';
import {SkillServiceClient} from '../../clients/SkillServiceClient';
import {ThunkDispatch} from 'redux-thunk';

const skillClient = SkillServiceClient.instance();

export namespace SkillActionCreator {
    import AddCategoryToTreeAction = SkillActions.AddCategoryToTreeAction;
    import AddSkillToTreeAction = SkillActions.AddSkillToTreeAction;
    import ReadSkillHierarchyAction = SkillActions.ReadSkillHierarchyAction;
    import SetAddSkillStepAction = SkillActions.SetAddSkillStepAction;
    import SetCurrentChoiceAction = SkillActions.SetCurrentChoiceAction;
    import UpdateSkillCategoryAction = SkillActions.PartiallyUpdateSkillCategoryAction;
    import RemoveSkillCategoryAction = SkillActions.RemoveSkillCategoryAction;
    import MoveSkillAction = SkillActions.MoveSkillAction;
    import RemoveSkillAction = SkillActions.RemoveSkillAction;
    import UpdateSkillServiceSkillAction = SkillActions.UpdateSkillServiceSkillAction;
    import BatchAddSkillsAction = SkillActions.BatchAddSkillsAction;
    import SetTreeChildrenOpenAction = SkillActions.SetTreeChildrenOpenAction;
    import FilterTreeAction = SkillActions.FilterTreeAction;
    import InitializeTreeAction = SkillActions.InitializeTreeAction;

    export function AddCategoryToTree(parentId: number, category: SkillCategory): AddCategoryToTreeAction {
        return {
            type: ActionType.AddCategoryToTree,
            parentId: parentId,
            toAdd: category
        };
    }


    export function AddSkillToTree(categoryId: number, skill: SkillServiceSkill): AddSkillToTreeAction {
        return {
            type: ActionType.AddSkillToTree,
            categoryId: categoryId,
            toAdd: skill
        };
    }

    export function ReadSkillHierarchy(skill: APISkillServiceSkill): ReadSkillHierarchyAction {
        return {
            type: ActionType.ReadSkillHierarchy,
            skill: skill
        };
    }

    export function SetCurrentSkillName(name: string): ChangeStringValueAction {
        return {
            value: name,
            type: ActionType.SetCurrentSkillName
        };
    }

    export function SetCurrentSkillRating(rating: number): ChangeNumberValueAction {
        return {
            value: rating,
            type: ActionType.SetCurrentSkillRating
        };
    }

    export function SetAddSkillStep(step: AddSkillStep): SetAddSkillStepAction {
        return {
            type: ActionType.SetAddSkillStep,
            step: step
        };
    }

    export function StepBackToSkillInfo(): AbstractAction {
        return {
            type: ActionType.StepBackToSkillInfo
        };
    }

    export function ResetAddSkillDialog(): AbstractAction {
        return {
            type: ActionType.ResetAddSkillDialog
        };
    }

    export function SetDoneMessage(msg: string): ChangeStringValueAction {
        return {
            type: ActionType.SetDoneMessage,
            value: msg
        };
    }

    export function ChangeSkillComment(comment: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangeSkillComment,
            value: comment
        };
    }

    export function SetCurrentChoice(choice: UnCategorizedSkillChoice): SetCurrentChoiceAction {
        return {
            type: ActionType.SetCurrentChoice,
            currentChoice: choice
        };
    }

    export function SetAddSkillError(text: string): ChangeStringValueAction {
        return {
            type: ActionType.SetAddSkillError,
            value: text
        };
    }

    export function SetTreeChildrenOpen(categoryId: number): SetTreeChildrenOpenAction {
        return {
            type: ActionType.SetTreeChildrenOpen,
            categoryId: categoryId,
        };
    }

    export function FilterTree(searchTerm: string): FilterTreeAction {
        return {
            type: ActionType.FilterTree,
            searchTerm: searchTerm
        };
    }

    export function SetAddToProjectId(projectId: string): ChangeStringValueAction {
        return {
            type: ActionType.SetAddToProjectId,
            value: projectId
        };
    }

    function SetNoCategoryReason(reason: string): ChangeStringValueAction {
        return {
            type: ActionType.SetNoCategoryReason,
            value: reason
        };
    }

    function UpdateSkillCategory(skillCategory: SkillCategory): UpdateSkillCategoryAction {
        return {
            type: ActionType.UpdateSkillCategory,
            skillCategory: skillCategory
        };
    }

    function RemoveSkillCategory(id: number): RemoveSkillCategoryAction {
        return {
            type: ActionType.RemoveSkillCategory,
            id: id
        };
    }

    function MoveCategory(newParentId: number, toMoveId: number) {
        return {
            type: ActionType.MoveCategory,
            newParentId: newParentId,
            toMoveId: toMoveId,
        };
    }

    function MoveSkill(originCategoryId: number, targetCategoryId: number, skillId: number): MoveSkillAction {
        return {
            type: ActionType.MoveSkill,
            skillId: skillId,
            targetCategoryId: targetCategoryId,
            originCategoryId: originCategoryId
        };
    }

    function RemoveSkill(skillId: number): RemoveSkillAction {
        return {
            type: ActionType.RemoveSkillServiceSkill,
            skillId: skillId
        };
    }

    function UpdateSkillServiceSkill(skill: SkillServiceSkill): UpdateSkillServiceSkillAction {
        return {
            type: ActionType.UpdateSkillServiceSkill,
            skill: skill
        };
    }

    function BatchAddSkills(skills: Array<SkillServiceSkill>): BatchAddSkillsAction {
        return {
            type: ActionType.BatchAddSkills,
            skills: skills
        };
    }

    function InitializeTree(root: TCategoryNode): InitializeTreeAction {
        return {
            type: ActionType.LoadTree,
            root: root
        };
    }


    function handleSkillServiceError(error: AxiosError) {
        console.error(error);
        if (error.response && error.response.data) {
            let response: SkillServiceError = error.response.data;
            Alerts.showError(response.errorType + ': ' + response.message);
        } else if (error.response) {
            Alerts.showError('Generic Error ' + error.response.status);
        } else {
            Alerts.showError('An unknown error occurred');
        }
    }


    function InvokeChildUpdate(categoryId: number, dispatch: ThunkDispatch<any, any, any>) {
        skillClient.getCategoryChildrenByCategoryId(categoryId)
            .then(response => response.forEach((value, index, array) => dispatch(AsyncUpdateCategory(value, true))))
            .catch(handleSkillServiceError);
    }

    export function AsyncUpdateCategory(categoryId: number, fullRecursive?: boolean) {
        return function (dispatch: redux.Dispatch) {
            let doRecursive: boolean = isNullOrUndefined(fullRecursive) ? false : fullRecursive;
            skillClient.getCategoryById(categoryId)
                .then((category) => dispatch(UpdateSkillCategory(SkillCategory.fromAPI(category))))
                .then(() => doRecursive ? InvokeChildUpdate(categoryId, dispatch) : console.log()) // TODO change else
                .catch(handleSkillServiceError);
        };
    }

    export function AsyncMoveCategory(newParentId: number, toMoveId: number) {
        return function (dispatch: redux.Dispatch) {
            skillClient.patchMoveCategory(newParentId, toMoveId)
                .then((category) => dispatch(MoveCategory(newParentId, toMoveId)))
                .catch(handleSkillServiceError);
        };
    }

    export function AsyncRequestSkillHierarchy(skillName: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let state = getState();
            if (!state.skillReducer.categorieHierarchiesBySkillName().has(skillName)) {
                skillClient.getSkillByName(skillName)
                    .then((skill) => dispatch(ReadSkillHierarchy(skill)))

                    .catch((error: any) => handleSkillServiceError(error));
            }
        };
    }

    /**
     * Invokes witelisting of the {@link SkillCategory} identified by the given ID.
     * If the category is already whitelisted, nothing will change.
     * If the category is not existent, BAD REQUEST is returned.
     * @param categoryId of the category to be whitelisted
     */
    export function AsyncWhitelistCategory(categoryId: number) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            skillClient.deleteBlacklistCategory(categoryId)
                .then(() => dispatch(AsyncUpdateCategory(categoryId, true)))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    export function AsyncBlacklistCategory(categoryId: number) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            skillClient.postBlacklistCategory(categoryId)
                .then(() => dispatch(AsyncUpdateCategory(categoryId, true)))

                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    export function AsyncSetIsDisplay(categoryId: number, isDisplay: boolean) {
        return function (dispatch: redux.Dispatch) {
            skillClient.patchSetIsDisplayCategory(categoryId, isDisplay)
                .then((category) => dispatch(UpdateSkillCategory(SkillCategory.fromAPI(category))))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    const invokeCategoryUpdate = (apiSkillCategory: APISkillCategory, dispatch: redux.Dispatch) => {
        let skillCategory = SkillCategory.fromAPI(apiSkillCategory);
        dispatch(UpdateSkillCategory(skillCategory));
        dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
    };

    export function AsyncAddLocale(categoryId: number, locale: string, qualifier: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.postLocaleToCategory(categoryId, locale, qualifier)
                .then((category) => invokeCategoryUpdate(category, dispatch))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    export function AsyncDeleteLocale(categoryId: number, language: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.deleteLocaleFromCategory(categoryId, language)
                .then((category) => invokeCategoryUpdate(category, dispatch))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    export function AsyncCreateCategory(qualifier: string, parentId: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let category: SkillCategory = SkillCategory.of(null, qualifier);
            skillClient.postNewCategory(parentId, category)
                .then((category) => dispatch(AddCategoryToTree(parentId, SkillCategory.fromAPI(category))))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }


    export function AsyncDeleteCategory(categoryId: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.deleteCategory(categoryId)
                .then((response: AxiosResponse) => dispatch(RemoveSkillCategory(categoryId)))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    /**
     * Retrieves a {@link SkillServiceSkill} from the skill service and adds it to the {@link SkillStore}.
     *
     * If the skill is already present, no operation is performed.
     *
     * @param qualifier of the skill to be retrieved
     * @param force forces a retrieval of the skill even if it is already loaded (Can be used to perform an update operation). Default: false
     * @constructor
     */
    export function AsyncGetSkillByName(qualifier: string, force?: boolean) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            if (!isNullOrUndefined(force)) {
                force = false;
            }
            if (!getState().skillReducer.skillWithQualifierExists(qualifier)) {
                skillClient.getSkillByName(qualifier)
                    .then((skill) => dispatch(AddSkillToTree(SkillServiceSkill.fromAPI(skill).categoryId(), SkillServiceSkill.fromAPI(skill))))
                    .catch(error => handleSkillServiceError(error));
            }
        };
    }

    export function AsyncMoveSkill(skillId: number, newCategoryId: number, oldCategoryId: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.patchMoveSkill(skillId, newCategoryId)
                .then((response: AxiosResponse) => dispatch(MoveSkill(oldCategoryId, newCategoryId, skillId)))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    export function AsyncCreateSkill(qualifier: string, categoryId: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.postNewSkill(categoryId, qualifier)
                .then((skill) => dispatch(AddSkillToTree(categoryId, SkillServiceSkill.fromAPI(skill))))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    export function AsyncDeleteSkill(skillId: number) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.deleteCustomSkill(skillId)
                .then((response: AxiosResponse) => dispatch(RemoveSkill(skillId)))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }

    /**
     * Invokes a POST call to the skill locale resource, persistently adding a locale to the skill.
     * @param skillId
     * @param language
     * @param qualifier
     * @constructor
     */
    export function AsyncAddSkillLocale(skillId: number, language: string, qualifier: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.addSkillLocale(skillId, language, qualifier)
                .then((skill) => dispatch(UpdateSkillServiceSkill(SkillServiceSkill.fromAPI(skill))))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }


    /**
     * Invokes a DELETE call to the skill locale endpoint, persistently deleting the locale
     * from the skill.
     * @param skillId of the skill whose locale is to be deleted
     * @param language defines which locale from the skill is deleted
     */
    export function AsyncDeleteSkillLocale(skillId: number, language: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.deleteSkillLocale(skillId, language)
                .then((response: AxiosResponse) => dispatch(UpdateSkillServiceSkill(SkillServiceSkill.fromAPI(response.data))))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }


    export function AsyncLoadTree() {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            skillClient.getFullTree()
                .then((root) => dispatch(InitializeTree(root)))
                .catch((error: AxiosError) => handleSkillServiceError(error));
        };
    }
}
