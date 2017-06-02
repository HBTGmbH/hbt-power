import {APIRequestType, ProfileElementType} from '../../Store';
import {NameEntity} from '../../model/NameEntity';
import {
    AbstractAction,
    ChangeStringValueAction,
    CreateEntryAction,
    DeleteEntryAction,
    DeleteProjectAction, DeleteViewProfileAction,
    ReceiveAPIResponseAction,
    SaveEntryAction,
    SaveProjectAction, SaveViewProfileAction, SelectViewProfileAction, SetSelectedIndexesAction,
    UpdateSkillRatingAction, ViewProfileSortAction
} from './database-actions';
import {ProjectDialogState} from '../../modules/profile/elements/project/project-dialog_module';
import {ActionType} from '../ActionType';
import {ViewProfile} from '../../model/viewprofile/ViewProfile';
import * as Immutable from 'immutable';
import {ViewElement} from '../../model/viewprofile/ViewElement';
import {Profile} from '../../model/Profile';
import {APIViewProfile} from '../../model/viewprofile/APIViewProfile';

export class ProfileActionCreator {
    public static changeAbstract(newAbstract: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangeAbstract,
            value: newAbstract
        };
    }

    /**
     * Creates an action that updates the state so that its profile request status is pending.
     * @returns {{type: ActionType}}
     */
    public static APIRequestPending() : AbstractAction {
        return {
            type: ActionType.APIRequestPending
        };
    }

    /**
     * Creates an action that update the state so the received consultant profile is used to replace
     * the current profile.
     * @param payload
     * @param reqType
     */
    public static APIRequestSuccessfull(payload: any, reqType: APIRequestType) : ReceiveAPIResponseAction {
        return {
            type: ActionType.APIRequestSuccess,
            payload: payload,
            requestType: reqType
        };
    }

    public static APIRequestFailed() : AbstractAction {
        return { type: ActionType.APIRequestFail };
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
        }
    }

    public static logOutUser(): AbstractAction {
        return {
            type: ActionType.LogOutUser
        }
    }

    public static SaveViewProfile(viewProfile: ViewProfile): SaveViewProfileAction {
        return {
            type: ActionType.SaveViewProfile,
            viewProfile: viewProfile
        }
    }

    public static DeleteViewProfile(id: string): DeleteViewProfileAction {
        return {
            type: ActionType.DeleteViewProfile,
            id: id
        }
    }

    public static SelectViewProfile(id: string): SelectViewProfileAction {
        return {
            type: ActionType.SelectViewProfile,
            id: id
        }
    }

    public static ReceiveAPIViewProfile(apiViewProfile:APIViewProfile): ReceiveAPIResponseAction {
        return {
            type: ActionType.APIRequestSuccess,
            payload: apiViewProfile,
            requestType: APIRequestType.RequestCreateViewProfile
        }
    }

    public static SelectIndexes(elementType: ProfileElementType, selectedIndexes: Array<number> | string, viewProfileId: string): SetSelectedIndexesAction {
        return {
            type: ActionType.SetSelectedIndexes,
            elementType: elementType,
            viewProfileId: viewProfileId,
            selectedIndexes: selectedIndexes
        }
    }
}


