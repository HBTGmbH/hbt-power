import {APIRequestType, ProfileElementType} from '../../Store';
import {NameEntity} from '../../model/NameEntity';
import {
    AbstractAction,
    AddSkillAction,
    ChangeStringValueAction,
    CreateEntryAction,
    DeleteEntryAction,
    DeleteProjectAction,
    ReceiveAPIResponseAction,
    SaveEntryAction,
    SaveProjectAction,
    UpdateSkillRatingAction
} from './database-actions';
import {ProjectDialogState} from '../../modules/home/profile/elements/project/project-dialog_module';
import {ActionType} from '../ActionType';

export class ProfileActionCreator {
    public static changeAbstract(newAbstract: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangeAbstract,
            value: newAbstract
        };
    }

    /**
     * Creates an action that update the state so the received consultant profile is used to replace
     * the current profile.
     * @param payload
     * @param reqType
     */
    public static APIRequestSuccessfull(payload: any, reqType: APIRequestType): ReceiveAPIResponseAction {
        return {
            type: ActionType.APIRequestSuccess,
            payload: payload,
            requestType: reqType
        };
    }

    public static deleteEntry(id: string, elementType: ProfileElementType): DeleteEntryAction {
        return {
            type: ActionType.DeleteEntry,
            elementType: elementType,
            elementId: id
        };
    }

    public static createEntry(elementType: ProfileElementType): CreateEntryAction {
        return {
            type: ActionType.CreateEntry,
            entryType: elementType
        };
    }

    public static saveEntry(entry: any, nameEntity: NameEntity, elementType: ProfileElementType): SaveEntryAction {
        return {
            type: ActionType.SaveEntry,
            entry: entry,
            nameEntity: nameEntity,
            entryType: elementType
        };
    }

    public static saveProject(state: ProjectDialogState): SaveProjectAction {
        return {
            type: ActionType.SaveProject,
            state: state
        };
    }

    public static deleteProject(id: string): DeleteProjectAction {
        return {
            type: ActionType.DeleteProject,
            id: id
        };
    }

    public static createProject(): AbstractAction {
        return {
            type: ActionType.CreateProject
        };
    }

    public static updateSkillRating(rating: number, id: string): UpdateSkillRatingAction {
        return {
            type: ActionType.UpdateSkillRating,
            id: id,
            rating: rating
        };
    }

    public static deleteSkill(id: string) {
        return {
            type: ActionType.DeleteSkill,
            id: id
        };
    }

    public static logOutUser(): AbstractAction {
        return {
            type: ActionType.LogOutUser
        };
    }

    public static AddSkill(skillName: string, rating: number, comment: string, projectId?: string): AddSkillAction {
        return {
            type: ActionType.AddSkill,
            skillName: skillName,
            rating: rating,
            comment: comment,
            projectId: projectId
        };
    }

    public static RemoveSkillFromProject(skillId: string, projectId: string) {
        return {
            type: ActionType.RemoveSkillFromProject,
            skillId: skillId,
            projectId: projectId
        };
    }

    public static FailLogin(): AbstractAction {
        return {
            type: ActionType.UserLoginFailed
        };
    }

    public static SetUserInitials(initials: string): ChangeStringValueAction {
        return {
            type: ActionType.SetUserInitials,
            value: initials
        };
    }
}


