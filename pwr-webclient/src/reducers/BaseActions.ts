import {AbstractAction} from './profile/database-actions';

export interface NumberValueAction extends AbstractAction {
    value: number;
}
