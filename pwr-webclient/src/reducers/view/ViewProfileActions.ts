import {ViewProfile} from '../../model/view/ViewProfile';
import {AbstractAction} from '../BaseActions';

export namespace ViewProfileActions {
    export interface SetViewProfileAction extends AbstractAction {
        viewProfile: ViewProfile;
    }

    export interface RemoveViewProfileAction extends AbstractAction {
        id: string;
    }

    export interface SetSortInProgressAction extends AbstractAction {
        inProgress: boolean;
    }
}
