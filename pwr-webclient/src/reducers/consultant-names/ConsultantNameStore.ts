import {ConsultantName} from '../../model/ConsultantName';

export interface ConsultantNameStore {
    /** By initials */
    names: Record<string, ConsultantName>;
    /** Requested once after the login; changes to consultants load them again */
    requested: boolean;
}

export const emptyConsultantNameStore: ConsultantNameStore = {
    names: {},
    requested: false
};
