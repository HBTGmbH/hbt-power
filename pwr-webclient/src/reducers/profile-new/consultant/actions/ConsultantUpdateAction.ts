import {Consultant} from '../model/Consultant';
import {ActionType} from '../../../ActionType';
import {AbstractAction} from '../../../BaseActions';

export interface ConsultantUpdateAction extends AbstractAction {
    consultant: Consultant;
}

export function consultantUpdateAction(consultant: Consultant): ConsultantUpdateAction {
    return {
        type: ActionType.UpdateConsultantAction,
        consultant: consultant
    };
}
