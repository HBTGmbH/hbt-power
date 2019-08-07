
import {APIRequestType, ProfileElementType} from '../../Store';

import {NameEntity} from '../../model/NameEntity';
import {ActionType} from '../ActionType';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {Action} from 'redux';
import {ProfileModificationStatus} from '../../model/ProfileModificationStatus';

export interface AbstractAction extends Action {
    type: ActionType;
}

export interface ChangeBoolValueAction extends AbstractAction {
    value: boolean;
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



