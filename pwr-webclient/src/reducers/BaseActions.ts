import {Action} from 'redux';
import {ActionType} from './ActionType';

export interface AbstractAction extends Action {
    type: ActionType;
}

export interface ChangeBoolValueAction extends AbstractAction {
    value: boolean;
}

export interface ChangeStringValueAction extends AbstractAction {
    value: string;
}

export interface ChangeNumberValueAction extends AbstractAction {
    value: number;
}
