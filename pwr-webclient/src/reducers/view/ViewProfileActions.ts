import {ViewProfile} from '../../model/view/ViewProfile';
import {AbstractAction} from '../profile/database-actions';

export namespace ViewProfileActions {
    export interface SetViewProfileAction extends AbstractAction{
        viewProfile: ViewProfile;
    }

    export interface RemoveViewProfileAction extends AbstractAction {
        id: string;
    }

    export interface SetSortInProgressAction extends AbstractAction {
        inProgress: boolean;
    }
}