import {AbstractAction} from '../BaseActions';
import {ActionType} from '../ActionType';
import {ConsultantNameStore, emptyConsultantNameStore} from './ConsultantNameStore';
import {ConsultantName} from '../../model/ConsultantName';

export interface ReceiveConsultantNamesAction extends AbstractAction {
    names: Array<ConsultantName>;
}

export function reduceConsultantNames(store: ConsultantNameStore = emptyConsultantNameStore,
                                      action: AbstractAction): ConsultantNameStore {
    switch (action.type) {
        case ActionType.RequestConsultantNames:
            return {...store, requested: true};
        case ActionType.ReceiveConsultantNames: {
            const names: Record<string, ConsultantName> = {};
            (action as ReceiveConsultantNamesAction).names.forEach(name => names[name.initials] = name);
            return {...store, names};
        }
    }
    return store;
}
