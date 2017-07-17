/**
 * @author nt | nt@hbt.de
 * Contains various actions that are dispatchable to the redux-store part represented by the {@link InternalDatabase}
 */

import {APIRequestType, ProfileElementType} from '../../Store';

import {NameEntity} from '../../model/NameEntity';
import {ProjectDialogState} from '../../modules/home/profile/elements/project/project-dialog_module';
import {ViewProfile} from '../../model/viewprofile/ViewProfile';
import {ActionType} from '../ActionType';
import {ConsultantInfo} from '../../model/ConsultantInfo';

export interface AbstractAction {
    type: ActionType;
}

export interface ChangeStringValueAction extends AbstractAction {
    /**
     * The new abstract text.
     */
    value: string;
}

export interface ReceiveAPIResponseAction extends AbstractAction {
    requestType: APIRequestType;
    payload: any;
}

export interface UpdateNameEntityAction extends AbstractAction {
    entryType: ProfileElementType;
    nameEntity: NameEntity;
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
    disableRedirect: boolean;
}

export interface UpdateSkillRatingAction extends AbstractAction {
    id: string,
    rating: number
}

export interface DeleteSkillAction extends AbstractAction {
    id: string;
}

/**
 * Saves (or creates) a view profile.
 */
export interface SaveViewProfileAction extends AbstractAction {
    viewProfile: ViewProfile;
}

export interface DeleteViewProfileAction extends AbstractAction {
    id: string;
}

export interface SelectViewProfileAction extends AbstractAction {
    id: string;
}

/**
 * Sets the selected indexes for the given view profile
 */
export interface SetSelectedIndexesAction extends AbstractAction {
    viewProfileId: string;
    elementType: ProfileElementType;
    // may be 'all', 'none' or an array of the indexes
    selectedIndexes: Array<number> | string;
}


export interface ViewProfileSortAction extends AbstractAction {
    /**
     * defines the table that is to be sorted.
     */
    elementType: ProfileElementType;

    /**
     * defines the index that is to be sorted. The reducer defines what happens
     * with this value. A structure like this allows moving most parts of the logic into
     * the reducer.
     */
    entryField: 'start' | 'end' | 'name' | 'level' | 'degree';

    /**
     * This varies per type of entry
     */
    naturalSortOrder: 'asc' | 'desc';

    viewProfileId: string;
}

export interface SwapIndexAction extends AbstractAction {
    elementType: ProfileElementType;
    viewProfileId: string;
    index1: number;
    index2: number;
}

export interface ChangeViewProfileAction extends AbstractAction {
    val: string;
    viewProfileId: string;
}

export interface AddSkillAction extends AbstractAction {
    skillName: string;
}

export interface ClearViewProfilesAction extends AbstractAction {

}


