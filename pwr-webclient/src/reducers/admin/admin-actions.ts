import {RequestStatus} from '../../Store';
import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {ActionType} from '../ActionType';
import {AbstractAction} from '../BaseActions';
import {ConsultantInfoDTO} from '../../model/ConsultantInfoDTO';

/**
 * Represents an action where the {@link AdminState#requestStatus} is changed to the given {@link RequestStatus}
 */
export interface ChangeRequestStatusAction extends AbstractAction {
    requestStatus: RequestStatus;
}

export interface ChangeLoginStatusAction extends AbstractAction {
    status: LoginStatus;
}

export interface ReceiveAllConsultantsAction extends AbstractAction {
    consultants: Array<ConsultantInfo>;
}

export interface ReceiveConsultantAction extends AbstractAction {
    consultant: ConsultantInfo;
}

export interface LoadConsultantInfoSuccess extends AbstractAction {
    consultantInfo: ConsultantInfoDTO[];
}
