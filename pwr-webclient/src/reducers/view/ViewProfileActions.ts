import {ViewProfile} from '../../model/view/ViewProfile';
import {AbstractAction} from '../BaseActions';
import {ViewCategory} from '../../model/view/ViewCategory';

export interface SetViewProfileAction extends AbstractAction {
  viewProfile: ViewProfile;
}

export interface RemoveViewProfileAction extends AbstractAction {
  id: string;
}

export interface SetSortInProgressAction extends AbstractAction {
  inProgress: boolean;
}

export interface SetParentCategoryAction extends AbstractAction {
  categoryMap: Map<number, ViewCategory>;
}
