import {APISkillCategory, SkillCategory} from '../../model/skill/SkillCategory';
import {SkillActions} from './SkillActions';
import {ActionType} from '../ActionType';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {
    getCategoryById,
    getCategoryChildrenByCategoryId,
    getRootCategoryIds,
    getSkillsForCategory
} from '../../API_CONFIG';
import axios, {AxiosResponse} from 'axios';
import {APISkillServiceSkill, SkillServiceSkill} from '../../model/skill/SkillServiceSkill';


export namespace SkillActionCreator {
    import AddCategoryToTreeAction = SkillActions.AddCategoryToTreeAction;
    import AddSkillToTreeAction = SkillActions.AddSkillToTreeAction;

    export function AddCategoryToTree(parentId: number, category: SkillCategory): AddCategoryToTreeAction {
        return {
            type: ActionType.AddCategoryToTree,
            parentId: parentId,
            toAdd: category
        }
    }

    export function AddSkillToTree(categoryId: number, skill: SkillServiceSkill): AddSkillToTreeAction {
        return {
            type: ActionType.AddSkillToTree,
            categoryId: categoryId,
            toAdd: skill
        }
    }


    export function AsyncLoadChildrenIntoTree(parentId: number, currentDepth: number) {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getCategoryChildrenByCategoryId(parentId)).then(function (response: AxiosResponse) {
                let data: number[] = response.data;
                data.forEach((value, index, array) => dispatch(AsyncLoadCategoryIntoTree(parentId, value, currentDepth - 1)));
            }).catch(function (error: any) {
                console.log(error);
            });
        }
    }

    export function AsyncLoadRootChildrenIntoTree() {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getRootCategoryIds()).then(function (response: AxiosResponse) {
                console.log(response.data);
                let categories: number[] = response.data;
                categories.forEach((value, index, array) => dispatch(AsyncLoadCategoryIntoTree(-1, value, 1)));
            }).catch(function (error: any) {
                console.log(error);
            });
        }
    }

    export function AsyncLoadCategoryIntoTree(parentId: number, id: number, remainingDepth: number) {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getCategoryById(id)).then(function (response: AxiosResponse) {
                let data: APISkillCategory = response.data;
                let category = SkillCategory.fromAPI(data);
                dispatch(AddCategoryToTree(parentId, category));
                dispatch(AsyncLoadSkillsForCategory(category.id()));
                if(remainingDepth > 0) {
                    dispatch(AsyncLoadChildrenIntoTree(category.id(), remainingDepth));
                }

            }).catch(function (error: any) {
                console.log(error);
            });
        }
    }
    export function AsyncLoadSkillsForCategory(categoryId: number) {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
        axios.get(getSkillsForCategory(categoryId)).then(function(response: AxiosResponse) {
            let skills: Array<APISkillServiceSkill> = response.data;
            skills.forEach(apiSkill =>  dispatch(AddSkillToTree(categoryId, SkillServiceSkill.fromAPI(apiSkill))));
        }).catch(function(error:any) {
            console.log(error);
        });
    }
}
}