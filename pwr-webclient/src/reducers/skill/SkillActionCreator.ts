import {APISkillCategory, SkillCategory} from '../../model/skill/SkillCategory';
import {ActionType} from '../ActionType';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {RequestStatus} from '../../Store';
import {AxiosError, AxiosResponse} from 'axios';
import {APISkillServiceSkill, SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
import {AdminActionCreator} from '../admin/AdminActionCreator';
import {SkillServiceError} from '../../model/skill/SkillServiceError';
import {TCategoryNode} from '../../model/skill/tree/TCategoryNode';
import {Alerts} from '../../utils/Alerts';
import {AbstractAction, ChangeNumberValueAction, ChangeStringValueAction} from '../BaseActions';
import {SkillServiceClient} from '../../clients/SkillServiceClient';
import {ThunkDispatch} from 'redux-thunk';
import {
    AddCategoryToTreeAction,
    AddSkillToTreeAction,
    FilterTreeAction,
    InitializeTreeAction,
    MoveSkillAction, PartiallyUpdateSkillCategoryAction,
    ReadSkillHierarchyAction,
    RemoveSkillAction,
    RemoveSkillCategoryAction,
    SetAddSkillStepAction,
    SetCurrentChoiceAction,
    SetTreeChildrenOpenAction,
    UpdateSkillServiceSkillAction
} from './SkillActions';

const skillClient = SkillServiceClient.instance();

export class SkillActionCreator {

    public static AddCategoryToTree(parentId: number, category: SkillCategory): AddCategoryToTreeAction {
        return {
            type: ActionType.AddCategoryToTree,
            parentId: parentId,
            toAdd: category
        };
    }


    public static AddSkillToTree(categoryId: number, skill: SkillServiceSkill): AddSkillToTreeAction {
        return {
            type: ActionType.AddSkillToTree,
            categoryId: categoryId,
            toAdd: skill
        };
    }

    public static ReadSkillHierarchy(skill: APISkillServiceSkill): ReadSkillHierarchyAction {
        return {
            type: ActionType.ReadSkillHierarchy,
            skill: skill
        };
    }

    public static SetCurrentSkillName(name: string): ChangeStringValueAction {
        return {
            value: name,
            type: ActionType.SetCurrentSkillName
        };
    }

    public static SetCurrentSkillRating(rating: number): ChangeNumberValueAction {
        return {
            value: rating,
            type: ActionType.SetCurrentSkillRating
        };
    }

    public static SetAddSkillStep(step: AddSkillStep): SetAddSkillStepAction {
        return {
            type: ActionType.SetAddSkillStep,
            step: step
        };
    }

    public static StepBackToSkillInfo(): AbstractAction {
        return {
            type: ActionType.StepBackToSkillInfo
        };
    }

    public static ResetAddSkillDialog(): AbstractAction {
        return {
            type: ActionType.ResetAddSkillDialog
        };
    }

    public static SetDoneMessage(msg: string): ChangeStringValueAction {
        return {
            type: ActionType.SetDoneMessage,
            value: msg
        };
    }

    public static ChangeSkillComment(comment: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangeSkillComment,
            value: comment
        };
    }

    public static SetCurrentChoice(choice: UnCategorizedSkillChoice): SetCurrentChoiceAction {
        return {
            type: ActionType.SetCurrentChoice,
            currentChoice: choice
        };
    }

    public static SetAddSkillError(text: string): ChangeStringValueAction {
        return {
            type: ActionType.SetAddSkillError,
            value: text
        };
    }

    public static SetTreeChildrenOpen(categoryId: number): SetTreeChildrenOpenAction {
        return {
            type: ActionType.SetTreeChildrenOpen,
            categoryId: categoryId,
        };
    }

    public static FilterTree(searchTerm: string): FilterTreeAction {
        return {
            type: ActionType.FilterTree,
            searchTerm: searchTerm
        };
    }

    private static UpdateSkillCategory(skillCategory: SkillCategory): PartiallyUpdateSkillCategoryAction {
        return {
            type: ActionType.UpdateSkillCategory,
            skillCategory: skillCategory
        };
    }

    private static RemoveSkillCategory(id: number): RemoveSkillCategoryAction {
        return {
            type: ActionType.RemoveSkillCategory,
            id: id
        };
    }

    private static MoveCategory(newParentId: number, toMoveId: number) {
        return {
            type: ActionType.MoveCategory,
            newParentId: newParentId,
            toMoveId: toMoveId,
        };
    }

    private static MoveSkill(originCategoryId: number, targetCategoryId: number, skillId: number): MoveSkillAction {
        return {
            type: ActionType.MoveSkill,
            skillId: skillId,
            targetCategoryId: targetCategoryId,
            originCategoryId: originCategoryId
        };
    }

    private static RemoveSkill(skillId: number): RemoveSkillAction {
        return {
            type: ActionType.RemoveSkillServiceSkill,
            skillId: skillId
        };
    }

    private static UpdateSkillServiceSkill(skill: SkillServiceSkill): UpdateSkillServiceSkillAction {
        return {
            type: ActionType.UpdateSkillServiceSkill,
            skill: skill
        };
    }

    private static InitializeTree(root: TCategoryNode): InitializeTreeAction {
        return {
            type: ActionType.LoadTree,
            root: root
        };
    }


    private static handleSkillServiceError(error: AxiosError) {
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


    private static InvokeChildUpdate(categoryId: number, dispatch: ThunkDispatch<any, any, any>) {
        skillClient.getCategoryChildrenByCategoryId(categoryId)
            .then(response => response.forEach((value) => dispatch(SkillActionCreator.AsyncUpdateCategory(value))))
            .catch(SkillActionCreator.handleSkillServiceError);
    }

    public static AsyncUpdateCategory(categoryId: number) {
        return function (dispatch: redux.Dispatch) {
            skillClient.getCategoryById(categoryId)
                .then((category) => dispatch(SkillActionCreator.UpdateSkillCategory(SkillCategory.fromAPI(category))))
                .then(() => SkillActionCreator.InvokeChildUpdate(categoryId, dispatch))
                .catch(SkillActionCreator.handleSkillServiceError);
        };
    }

    public static AsyncMoveCategory(newParentId: number, toMoveId: number) {
        return function (dispatch: redux.Dispatch) {
            skillClient.patchMoveCategory(newParentId, toMoveId)
                .then(() => dispatch(SkillActionCreator.MoveCategory(newParentId, toMoveId)))
                .catch(SkillActionCreator.handleSkillServiceError);
        };
    }

    public static AsyncRequestSkillHierarchy(skillName: string) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            let state = getState();
            if (!state.skillReducer.categorieHierarchiesBySkillName.has(skillName)) {
                skillClient.getSkillByName(skillName)
                    .then((skill) => dispatch(SkillActionCreator.ReadSkillHierarchy(skill)))

                    .catch((error: any) => SkillActionCreator.handleSkillServiceError(error));
            }
        };
    }

    /**
     * Invokes witelisting of the {@link SkillCategory} identified by the given ID.
     * If the category is already whitelisted, nothing will change.
     * If the category is not existent, BAD REQUEST is returned.
     * @param categoryId of the category to be whitelisted
     */
    public static AsyncWhitelistCategory(categoryId: number) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            skillClient.deleteBlacklistCategory(categoryId)
                .then(() => dispatch(SkillActionCreator.AsyncUpdateCategory(categoryId)))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    public static AsyncBlacklistCategory(categoryId: number) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            skillClient.postBlacklistCategory(categoryId)
                .then(() => dispatch(SkillActionCreator.AsyncUpdateCategory(categoryId)))

                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    public static AsyncSetIsDisplay(categoryId: number, isDisplay: boolean) {
        return function (dispatch: redux.Dispatch) {
            skillClient.patchSetIsDisplayCategory(categoryId, isDisplay)
                .then((category) => dispatch(SkillActionCreator.UpdateSkillCategory(SkillCategory.fromAPI(category))))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    private static invokeCategoryUpdate = (apiSkillCategory: APISkillCategory, dispatch: redux.Dispatch) => {
        let skillCategory = SkillCategory.fromAPI(apiSkillCategory);
        dispatch(SkillActionCreator.UpdateSkillCategory(skillCategory));
        dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
    };

    public static AsyncAddLocale(categoryId: number, locale: string, qualifier: string) {
        return function (dispatch: redux.Dispatch) {
            skillClient.postLocaleToCategory(categoryId, locale, qualifier)
                .then((category) => SkillActionCreator.invokeCategoryUpdate(category, dispatch))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    public static AsyncDeleteLocale(categoryId: number, language: string) {
        return function (dispatch: redux.Dispatch) {
            skillClient.deleteLocaleFromCategory(categoryId, language)
                .then((category) => SkillActionCreator.invokeCategoryUpdate(category, dispatch))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    public static AsyncCreateCategory(qualifier: string, parentId: number) {
        return function (dispatch: redux.Dispatch) {
            let category: SkillCategory = SkillCategory.of(null, qualifier);
            skillClient.postNewCategory(parentId, category)
                .then((category) => dispatch(SkillActionCreator.AddCategoryToTree(parentId, SkillCategory.fromAPI(category))))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }


    public static AsyncDeleteCategory(categoryId: number) {
        return function (dispatch: redux.Dispatch) {
            skillClient.deleteCategory(categoryId)
                .then(() => dispatch(SkillActionCreator.RemoveSkillCategory(categoryId)))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }


    public static AsyncMoveSkill(skillId: number, newCategoryId: number, oldCategoryId: number) {
        return function (dispatch: redux.Dispatch) {
            skillClient.patchMoveSkill(skillId, newCategoryId)
                .then(() => dispatch(SkillActionCreator.MoveSkill(oldCategoryId, newCategoryId, skillId)))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    public static AsyncCreateSkill(qualifier: string, categoryId: number) {
        return function (dispatch: redux.Dispatch) {
            skillClient.postNewSkill(categoryId, qualifier)
                .then((skill) => dispatch(SkillActionCreator.AddSkillToTree(categoryId, SkillServiceSkill.fromAPI(skill))))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    public static AsyncDeleteSkill(skillId: number) {
        return function (dispatch: redux.Dispatch) {
            skillClient.deleteCustomSkill(skillId)
                .then(() => dispatch(SkillActionCreator.RemoveSkill(skillId)))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }

    /**
     * Invokes a POST call to the skill locale resource, persistently adding a locale to the skill.
     * @param skillId
     * @param language
     * @param qualifier
     * @constructor
     */
    public static AsyncAddSkillLocale(skillId: number, language: string, qualifier: string) {
        return function (dispatch: redux.Dispatch) {
            skillClient.addSkillLocale(skillId, language, qualifier)
                .then((skill) => dispatch(SkillActionCreator.UpdateSkillServiceSkill(SkillServiceSkill.fromAPI(skill))))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }


    /**
     * Invokes a DELETE call to the skill locale endpoint, persistently deleting the locale
     * from the skill.
     * @param skillId of the skill whose locale is to be deleted
     * @param language defines which locale from the skill is deleted
     */
    public static AsyncDeleteSkillLocale(skillId: number, language: string) {
        return function (dispatch: redux.Dispatch) {
            skillClient.deleteSkillLocale(skillId, language)
                .then((response: AxiosResponse) => dispatch(SkillActionCreator.UpdateSkillServiceSkill(SkillServiceSkill.fromAPI(response.data))))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }


    public static AsyncLoadTree() {
        return function (dispatch: redux.Dispatch) {
            skillClient.getFullTree()
                .then((root) => dispatch(SkillActionCreator.InitializeTree(root)))
                .catch((error: AxiosError) => SkillActionCreator.handleSkillServiceError(error));
        };
    }
}
