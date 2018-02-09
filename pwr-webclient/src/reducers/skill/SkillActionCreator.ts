import {APISkillCategory, SkillCategory} from '../../model/skill/SkillCategory';
import {SkillActions} from './SkillActions';
import {ActionType} from '../ActionType';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {RequestStatus} from '../../Store';
import {
    deleteBlacklistCategory,
    deleteCategory,
    deleteCustomSkill,
    deleteLocaleFromCategory,
    getCategoryById,
    getCategoryChildrenByCategoryId,
    getRootCategoryIds,
    getSkillByName,
    getSkillsForCategory,
    patchMoveSkill,
    patchSetIsDisplayCategory,
    postLocaleToCategory,
    postNewCategory,
    postNewSkill,
    skillLocale
} from '../../API_CONFIG';
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {APISkillServiceSkill, SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {AbstractAction, ChangeNumberValueAction, ChangeStringValueAction} from '../profile/database-actions';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {isNullOrUndefined} from 'util';
import {ProfileActionCreator} from '../profile/ProfileActionCreator';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
import {AdminActionCreator} from '../admin/AdminActionCreator';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {NavigationActionCreator} from '../navigation/NavigationActionCreator';
import {SkillServiceError} from '../../model/skill/SkillServiceError';


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
        }
    }

    export function StepBackToSkillInfo(): AbstractAction {
        return {
            type: ActionType.StepBackToSkillInfo
        }
    }

    export function ResetAddSkillDialog(): AbstractAction {
        return {
            type: ActionType.ResetAddSkillDialog
        }
    }

    export function SetDoneMessage(msg: string): ChangeStringValueAction {
        return {
            type: ActionType.SetDoneMessage,
            value: msg
        }
    }

    export function ChangeSkillComment(comment: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangeSkillComment,
            value: comment
        }
    }

    export function SetCurrentChoice(choice: UnCategorizedSkillChoice): SetCurrentChoiceAction {
        return {
            type: ActionType.SetCurrentChoice,
            currentChoice: choice
        }
    }

    export function SetAddSkillError(text: string): ChangeStringValueAction {
        return {
            type: ActionType.SetAddSkillError,
            value: text
        }
    }

    export function SetTreeChildrenOpen(categoryId: number): SetTreeChildrenOpenAction {
        return {
            type: ActionType.SetTreeChildrenOpen,
            categoryId: categoryId,
        }
    }

    export function FilterTree(searchTerm: string): FilterTreeAction {
        return {
            type: ActionType.FilterTree,
            searchTerm: searchTerm
        }
    }

    export function SetAddToProjectId(projectId: string): ChangeStringValueAction {
        return {
            type: ActionType.SetAddToProjectId,
            value: projectId
        }
    }

    function SetNoCategoryReason(reason: string): ChangeStringValueAction {
        return {
            type: ActionType.SetNoCategoryReason,
            value: reason
        }
    }

    function UpdateSkillCategory(skillCategory: SkillCategory): UpdateSkillCategoryAction {
        return {
            type: ActionType.UpdateSkillCategory,
            skillCategory: skillCategory
        }
    }

    function RemoveSkillCategory(id: number): RemoveSkillCategoryAction {
        return {
            type: ActionType.RemoveSkillCategory,
            id: id
        }
    }

    function MoveSkill(originCategoryId: number, targetCategoryId: number, skillId: number): MoveSkillAction {
        return {
            type: ActionType.MoveSkill,
            skillId: skillId,
            targetCategoryId: targetCategoryId,
            originCategoryId: originCategoryId
        }
    }

    function RemoveSkill(skillId: number): RemoveSkillAction {
        return {
            type: ActionType.RemoveSkillServiceSkill,
            skillId: skillId
        }
    }

    function UpdateSkillServiceSkill(skill: SkillServiceSkill): UpdateSkillServiceSkillAction {
        return {
            type: ActionType.UpdateSkillServiceSkill,
            skill: skill
        }
    }

    function BatchAddSkills(skills: Array<SkillServiceSkill>): BatchAddSkillsAction {
        return {
            type: ActionType.BatchAddSkills,
            skills: skills
        }
    }



    let currentAPICalls = 0;

    function handleSkillServiceError(error: AxiosError) {
        console.error(error);
        if (error.response && error.response.data) {
            let response: SkillServiceError = error.response.data;
            NavigationActionCreator.showError(response.errorType + ": " + response.message);
        } else if (error.response) {
            NavigationActionCreator.showError("Generic Error " + error.response.status);
        } else {
            NavigationActionCreator.showError("An unknown error occurred");
        }
    }

    function beginAPICall(dispatch: redux.Dispatch<ApplicationState>) {
        if(currentAPICalls === 0) {
            dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Pending));
        }
        currentAPICalls++;
       // dispatch(ChangeSkillRequestCount(true));
    }

    function succeedAPICall(dispatch: redux.Dispatch<ApplicationState>) {
        currentAPICalls--;
        if(currentAPICalls === 0) {
            dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
        }
    }

    function failAPICall(dispatch: redux.Dispatch<ApplicationState>) {
        currentAPICalls --;
        if(currentAPICalls === 0) {
            dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Failiure));
        }
    }

    function wrappedGetCall(uri: string,
                            dispatch: redux.Dispatch<ApplicationState>,
                            onSuccess: (response: AxiosResponse) => void,
                            onError?: (error: AxiosError) => void,
                            config?: AxiosRequestConfig) {
        beginAPICall(dispatch);
        axios.get(uri, config).then(function (response: AxiosResponse) {
            succeedAPICall(dispatch);
            onSuccess(response);
        }).catch(function (error: any) {
            failAPICall(dispatch);
            onError(error);
            console.log(error);
        });
    }

    export function AsyncLoadChildrenIntoTree(parentId: number, currentDepth: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            wrappedGetCall(getCategoryChildrenByCategoryId(parentId), dispatch, response => {
                let data: number[] = response.data;
                data.forEach((value, index, array) => dispatch(AsyncLoadCategoryIntoTree(parentId, value, currentDepth - 1)));
            });
        };
    }

    export function AsyncLoadRootChildrenIntoTree() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getRootCategoryIds()).then(function (response: AxiosResponse) {
                let categories: number[] = response.data;
                categories.forEach((value, index, array) => dispatch(AsyncLoadCategoryIntoTree(-1, value, 99)));
            }).catch(handleSkillServiceError);
        };
    }

    function InvokeChildUpdate(categoryId: number, dispatch: redux.Dispatch<ApplicationState>) {
        axios.get(getCategoryChildrenByCategoryId(categoryId)).then(function (response: AxiosResponse) {
            let data: number[] = response.data;
            data.forEach((value, index, array) => dispatch(AsyncUpdateCategory(value, true)));
        }).catch(handleSkillServiceError);
    }

    export function AsyncUpdateCategory(categoryId: number, fullRecursive?: boolean) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            let doRecursive: boolean = isNullOrUndefined(fullRecursive) ? false : fullRecursive;
            axios.get(getCategoryById(categoryId)).then(function (response: AxiosResponse) {
                let data: APISkillCategory = response.data;
                let category = SkillCategory.fromAPI(data);
                dispatch(UpdateSkillCategory(category));
                if(doRecursive) {
                    InvokeChildUpdate(categoryId, dispatch);
                }
            }).catch(handleSkillServiceError);
        };
    }

    export function AsyncLoadCategoryIntoTree(parentId: number, id: number, remainingDepth: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getCategoryById(id)).then(function (response: AxiosResponse) {
                let data: APISkillCategory = response.data;
                let category = SkillCategory.fromAPI(data);
                dispatch(AddCategoryToTree(parentId, category));
                dispatch(AsyncLoadSkillsForCategory(category.id()));
                if (remainingDepth > 0) {
                    dispatch(AsyncLoadChildrenIntoTree(category.id(), remainingDepth));
                }

            }).catch(handleSkillServiceError);
        };
    }

    export function AsyncLoadSkillsForCategory(categoryId: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            beginAPICall(dispatch);
            axios.get(getSkillsForCategory(categoryId)).then(function (response: AxiosResponse) {
                succeedAPICall(dispatch);
                let skills: Array<APISkillServiceSkill> = response.data;
                skills.forEach(apiSkill => dispatch(AddSkillToTree(categoryId, SkillServiceSkill.fromAPI(apiSkill))));
            }).catch(function (error: any) {
                failAPICall(dispatch);
                handleSkillServiceError(error);
            });
        };
    }

    export function AsyncRequestSkillHierarchy(skillName: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let state = getState();
            if (!state.skillReducer.categorieHierarchiesBySkillName().has(skillName)) {
                let config: AxiosRequestConfig = {params: {qualifier: skillName}};
                beginAPICall(dispatch);
                axios.get(getSkillByName(), config).then((response: AxiosResponse) => {
                    succeedAPICall(dispatch);
                    dispatch(ReadSkillHierarchy(response.data));
                }).catch(function (error: any) {
                    failAPICall(dispatch);
                    handleSkillServiceError(error);
                });
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
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            beginAPICall(dispatch);
            axios.delete(deleteBlacklistCategory(categoryId)).then((response: AxiosResponse) => {
                let apiCategory: APISkillCategory = response.data;
                let parentId: number = null;
                if(!isNullOrUndefined(apiCategory.category)) {
                    parentId = apiCategory.category.id;
                }
                succeedAPICall(dispatch);
                dispatch(AsyncUpdateCategory(categoryId, true));
            }).catch((error: AxiosError) => {
                failAPICall(dispatch);
                handleSkillServiceError(error);
            });
        }
    }

    export function AsyncBlacklistCategory(categoryId: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            beginAPICall(dispatch);
            axios.post(deleteBlacklistCategory(categoryId)).then((response: AxiosResponse) => {
                let apiCategory: APISkillCategory = response.data;
                let parentId: number = null;
                if(!isNullOrUndefined(apiCategory.category)) {
                    parentId = apiCategory.category.id;
                }
                succeedAPICall(dispatch);
                dispatch(AsyncUpdateCategory(categoryId, true));
            }).catch((error: AxiosError) => {
                failAPICall(dispatch);
                handleSkillServiceError(error);
            });
        }
    }

    export function AsyncSetIsDisplay(categoryId: number, isDisplay: boolean) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            beginAPICall(dispatch);
            axios.patch(patchSetIsDisplayCategory(categoryId, isDisplay)).then((response: AxiosResponse) => {
                let apiCategory: APISkillCategory = response.data;
                dispatch(UpdateSkillCategory(SkillCategory.fromAPI(apiCategory)));
                succeedAPICall(dispatch);
            }).catch((error: AxiosError) => {
                failAPICall(dispatch);
                handleSkillServiceError(error);
            });
        }
    }

    const invokeCategoryUpdate = (apiSkillCategory: APISkillCategory, dispatch: redux.Dispatch<ApplicationState>) => {
        let skillCategory = SkillCategory.fromAPI(apiSkillCategory);
        succeedAPICall(dispatch);
        dispatch(UpdateSkillCategory(skillCategory));
        dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
    };

    export function AsyncAddLocale(categoryId: number, locale: string, qualifier: string) {
        return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let config: AxiosRequestConfig = {
                params: {
                    lang: locale,
                    qualifier: qualifier
                }
            };
            beginAPICall(dispatch);
            axios.post(postLocaleToCategory(categoryId), {}, config).then((response: AxiosResponse) => {
                invokeCategoryUpdate(response.data, dispatch);
            }).catch((error: AxiosError) => {
                console.log(error);
                failAPICall(dispatch);
                handleSkillServiceError(error);
            });
        }
    }

    export function AsyncDeleteLocale(categoryId: number, language: string) {
        return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            beginAPICall(dispatch);
            axios.delete(deleteLocaleFromCategory(categoryId, language)).then((response: AxiosResponse) => {
                invokeCategoryUpdate(response.data, dispatch);
            }).catch((error: AxiosError) => {
                console.log(error);
                failAPICall(dispatch);
                handleSkillServiceError(error);
            });
        }
    }

    export function AsyncCreateCategory(qualifier: string, parentId: number) {
        return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let category: SkillCategory = SkillCategory.of(null, qualifier);
            beginAPICall(dispatch);
            axios.post(postNewCategory(parentId), category).then((response: AxiosResponse) => {
                let data: APISkillCategory = response.data;
                succeedAPICall(dispatch);
                dispatch(AddCategoryToTree(parentId, SkillCategory.fromAPI(data)));
            }).catch((error: AxiosError) => {
                failAPICall(dispatch);
                handleSkillServiceError(error);
            });
        }
    }



    export function AsyncDeleteCategory(categoryId: number) {
        return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            beginAPICall(dispatch);
            axios.delete(deleteCategory(categoryId)).then((respone: AxiosResponse) => {
                dispatch(RemoveSkillCategory(categoryId));
                succeedAPICall(dispatch);
            }).catch((error: AxiosError) => {
                failAPICall(dispatch);
                handleSkillServiceError(error);
            })
        }
    }

    export namespace Tree {

    }

    export namespace Skill {

        function getSkillByQualifier(qualifier: string, onSuccess: (skill: SkillServiceSkill) => void, onError: (error: AxiosError) => void) {
            let config: AxiosRequestConfig = {params: {qualifier: qualifier}};
            axios.get(getSkillByName(), config).then((response: AxiosResponse) => {
                if(response.status === 200) {
                    onSuccess( SkillServiceSkill.fromAPI(response.data))
                } else {
                    onSuccess(null);
                }
            }).catch(onError);
        }

        const checkAndInvoke = (skills: Array<SkillServiceSkill>, skillsChanged: number, remainingRequests: number, dsp: redux.Dispatch<ApplicationState>) => {
            if(remainingRequests <= 0) {
                dsp(ProfileActionCreator.SucceedAPIRequest());
                if(skillsChanged != 0) {
                    dsp(BatchAddSkills(skills));
                }
            }
        };

        export function AsyncGetSkillsByName(qualifiers: Array<string>) {
            return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                let skills: Array<SkillServiceSkill> = [];
                let skillStore = getState().skillReducer;
                let filteredQualifiers = qualifiers.filter(qualifier => {
                    return !skillStore.skillWithQualifierExists(qualifier)
                });
                let remaining = filteredQualifiers.length;
                if(remaining > 0) {
                    dispatch(ProfileActionCreator.APIRequestPending());

                    for(let i = 0; i < filteredQualifiers.length; i++) {
                        getSkillByQualifier(filteredQualifiers[i], skill => {
                            remaining--;
                            if(skill != null) {
                                skills.push(skill);
                            }
                            checkAndInvoke(skills, skills.length, remaining, dispatch);
                        }, error => {
                            remaining--;
                            checkAndInvoke(skills, skills.length, remaining, dispatch);
                        });
                    }
                }
            }
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
            return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                if(!isNullOrUndefined(force)) {
                    force = false;
                }
                if(!getState().skillReducer.skillWithQualifierExists(qualifier)) {
                    beginAPICall(dispatch);
                    getSkillByQualifier(qualifier, (skill) => {
                        dispatch(AddSkillToTree(skill.categoryId(), skill));
                    }, (error) => {
                        console.error(error);
                        failAPICall(dispatch);
                        handleSkillServiceError(error);
                    });
                }

            }
        }

        export function AsyncMoveSkill(skillId: number, newCategoryId: number, oldCategoryId: number) {
            return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                beginAPICall(dispatch);
                axios.patch(patchMoveSkill(skillId, newCategoryId)).then((response: AxiosResponse) => {
                    dispatch(MoveSkill(oldCategoryId, newCategoryId, skillId));
                    succeedAPICall(dispatch);
                }).catch((error: AxiosError) => {
                    failAPICall(dispatch);
                    handleSkillServiceError(error);
                });
            }
        }

        export function AsyncCreateSkill(qualifier: string, categoryId: number) {
            return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                let skill: SkillServiceSkill = SkillServiceSkill.forQualifier(qualifier);
                beginAPICall(dispatch);
                axios.post(postNewSkill(categoryId), skill).then((response: AxiosResponse) => {
                    let data: APISkillServiceSkill = response.data;
                    succeedAPICall(dispatch);
                    dispatch(AddSkillToTree(categoryId, SkillServiceSkill.fromAPI(data)));
                }).catch((error: AxiosError) => {
                    failAPICall(dispatch);
                    handleSkillServiceError(error);
                });
            }
        }

        export function AsyncDeleteSkill(skillId: number) {
            return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                beginAPICall(dispatch);
                axios.delete(deleteCustomSkill(skillId)).then((response: AxiosResponse) => {
                    dispatch(RemoveSkill(skillId));
                    succeedAPICall(dispatch);
                }).catch((error: AxiosError) => {
                    failAPICall(dispatch);
                    handleSkillServiceError(error);
                })
            }
        }

        /**
         * Invokes a POST call to the skill locale resource, persistently adding a locale to the skill.
         * @param skillId
         * @param language
         * @param qualifier
         * @constructor
         */
        export function AsyncAddSkillLocale(skillId: number, language: string, qualifier: string) {
            return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                beginAPICall(dispatch);
                let config: AxiosRequestConfig = {params: {qualifier: qualifier}};
                axios.post(skillLocale(skillId, language), null, config).then((response: AxiosResponse) => {
                    dispatch(UpdateSkillServiceSkill(SkillServiceSkill.fromAPI(response.data)));
                    succeedAPICall(dispatch);
                }).catch((error: AxiosError) => {
                    failAPICall(dispatch);
                    handleSkillServiceError(error);
                })
            }
        }

        /**
         * Invokes a DELETE call to the skill locale endpoint, persistently deleting the locale
         * from the skill.
         * @param skillId of the skill whose locale is to be deleted
         * @param language defines which locale from the skill is deleted
         */
        export function AsyncDeleteSkillLocale(skillId: number, language: string) {
            return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
                beginAPICall(dispatch);
                axios.delete(skillLocale(skillId, language)).then((response: AxiosResponse) => {
                    dispatch(UpdateSkillServiceSkill(SkillServiceSkill.fromAPI(response.data)));
                    succeedAPICall(dispatch);
                }).catch((error: AxiosError) => {
                    failAPICall(dispatch);
                    handleSkillServiceError(error);
                })
            }
        }
    }



    export function AsyncProgressAddSkill() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let state = getState().skillReducer;
            let step = state.currentAddSkillStep();
            // Simple state machine that defines how to progress from one state into another.
            // State progression is rather simple, for more, see AddSkillStep enum
            if(step === AddSkillStep.NONE) {
                dispatch(SetAddSkillStep(AddSkillStep.SKILL_INFO))
            } else if (step === AddSkillStep.SKILL_INFO) {
                let skillName = state.currentSkillName();
                let skill = getState().databaseReducer.profile().getSkillByName(skillName);
                if(!isNullOrUndefined(skill)) {
                    dispatch(SetAddSkillStep(AddSkillStep.DONE));
                    dispatch(SetDoneMessage("SKILL_EXISTS"));
                } else {
                    let hierarchy = state.categorieHierarchiesBySkillName().get(state.currentSkillName());
                    if(!isNullOrUndefined(hierarchy)) {
                        dispatch(SetAddSkillStep(AddSkillStep.SHOW_CATEGORY));
                    } else {
                        dispatch(SetAddSkillStep(AddSkillStep.CATEGORY_REQUEST_PENDING));
                        let config: AxiosRequestConfig = {params: {qualifier: skillName}};
                        axios.get(getSkillByName(), config).then((response: AxiosResponse) => {
                            if(response.status === 200) {
                                if(response.data.category != null) {
                                    dispatch(ReadSkillHierarchy(response.data));
                                    dispatch(SetAddSkillStep(AddSkillStep.SHOW_CATEGORY))
                                } else {
                                    dispatch(SetNoCategoryReason("NO_CATEGORY_AVAILABLE"));
                                    dispatch(SetAddSkillStep(AddSkillStep.SHOW_EDITING_OPTIONS));
                                }
                            } else if(response.status === 204){
                                dispatch(SetNoCategoryReason("NO_CATEGORY_AVAILABLE"));
                                dispatch(SetAddSkillStep(AddSkillStep.SHOW_EDITING_OPTIONS));
                            } else {
                                dispatch(SetNoCategoryReason("SERVER_ERROR"));
                                dispatch(SetAddSkillStep(AddSkillStep.SHOW_EDITING_OPTIONS));
                            }
                        }).catch(function (error: AxiosError) {
                            console.error(error);
                            if(!isNullOrUndefined(error.response) && (error.response.status === 400 || error.response.status === 404)) {
                                dispatch(SetNoCategoryReason("SERVICE_NOT_AVAILABLE"));
                            } else {
                                dispatch(SetNoCategoryReason("UNKNOWN"));
                            }
                            dispatch(SetAddSkillStep(AddSkillStep.SHOW_EDITING_OPTIONS));
                        });
                    }
                }
            } else if (step === AddSkillStep.SHOW_CATEGORY) {
                dispatch(SetAddSkillStep(AddSkillStep.DONE));
            } else if(step === AddSkillStep.SHOW_EDITING_OPTIONS) {
                if(state.currentChoice() === UnCategorizedSkillChoice.PROCEED_WITH_COMMENT && state.skillComment().trim() !== "") {
                    dispatch(SetAddSkillStep(AddSkillStep.DONE));
                } else if(state.currentChoice() === UnCategorizedSkillChoice.PROCEED_WITH_COMMENT) {
                    dispatch(SetAddSkillError(PowerLocalize.get("AddSkillDialog.Comment.ErrorEmpty")));
                } else {
                    dispatch(SetAddSkillStep(AddSkillStep.DONE));
                }
            } else if (step === AddSkillStep.DONE) {
                if(state.addToProjectId().length > 0) {
                    dispatch(ProfileActionCreator.AddSkill(state.currentSkillName(), state.currentSkillRating(), state.skillComment(), state.addToProjectId()));
                } else if (state.doneState() !== "SKILL_EXISTS") {
                    dispatch(ProfileActionCreator.AddSkill(state.currentSkillName(), state.currentSkillRating(), state.skillComment()));
                }
                dispatch(ResetAddSkillDialog());
            }
        }

    }

}