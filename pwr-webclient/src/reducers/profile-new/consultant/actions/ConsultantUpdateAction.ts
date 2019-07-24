import {AbstractAction} from '../../../profile/database-actions';
import {Consultant} from '../model/Consultant';
import {ActionType} from '../../../ActionType';

export interface ConsultantUpdateAction extends AbstractAction {
    consultant: Consultant;
}

export function consultantUpdateAction(consultant: Consultant): ConsultantUpdateAction {
    return {
        type: ActionType.UpdateConsultantAction,
        consultant: consultant
    };
}