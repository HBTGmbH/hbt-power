/**
 * @author nt | nt@hbt.de
 * Contains various actions that are dispatchable to the redux-store part represented by the {@link ProfileStore}
 */

import {APIRequestType, ProfileElementType} from '../../Store';

import {NameEntity} from '../../model/NameEntity';
import {ProjectDialogState} from '../../modules/home/profile/elements/project/project-dialog_module';
import {ActionType} from '../ActionType';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {Action} from 'redux';

export interface AbstractAction extends Action{
    type: ActionType;
}

export interface ChangeStringValueAction extends AbstractAction {
    /**
     * The new abstract text.
     */
    value: string;
}

export interface ChangeNumberValueAction extends AbstractAction {
    /**
     * The new abstract text.
     */
    value: number;
}


export interface ReceiveAPIResponseAction extends AbstractAction {
    requestType: APIRequestType;
    payload: any;
}

export interface CreateEntryAction extends  AbstractAction {
    entryType: ProfileElementType;
}

/**
 * Action used to represent the removal of an entry in the profile. The entry that is removed
 * is defined by the elementType and by their id.
 */
export interface DeleteEntryAction extends AbstractAction {
    elementType: ProfileElementType;
    elementId: string;
}

/**
 * Represents a save operation on an arbitrary {@link ProfileElementType}. To allow this, any is used (unfortunately...).
 * the {@link SaveEntryAction.entry} will contain the profile entry, while the {@link SaveEntryAction.nameEntity}
 * may contain a {@link NameEntity} that was created by this client. Thiis {@link NameEntity} has to be added into the
 * database as possible suggestion. 
 */
export interface SaveEntryAction extends AbstractAction {
    entryType: ProfileElementType;
    entry: any;
    nameEntity: NameEntity;
}

/**
 * FIXME doc
 */
export interface SaveProjectAction extends AbstractAction {
    state: ProjectDialogState
}

export interface DeleteProjectAction extends AbstractAction {
    id: string;
}

/**
 * Action that invokes login of a user. Includes async requests to receive an OAuth2 token.
 */
export interface LoginAction extends AbstractAction {
    consultantInfo: ConsultantInfo;
}

export interface UpdateSkillRatingAction extends AbstractAction {
    id: string,
    rating: number
}

export interface DeleteSkillAction extends AbstractAction {
    id: string;
}

export interface AddSkillAction extends AbstractAction {
    skillName: string;
    rating: number;
    comment: string;
    projectId?: string
}

export interface RemoveSkillFromProjectAction extends AbstractAction {
    type: ActionType.RemoveSkillFromProject;
    skillId: string;
    projectId: string;
}



