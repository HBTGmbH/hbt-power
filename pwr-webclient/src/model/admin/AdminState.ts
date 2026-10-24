import * as Immutable from 'immutable';
import {RequestStatus} from '../../Store';
import {LoginStatus} from '../LoginStatus';
import {ConsultantInfo} from '../ConsultantInfo';
import {ConsultantInfoDTO} from '../ConsultantInfoDTO';

export interface AdminState {
    requestStatus: RequestStatus;
    loginStatus: LoginStatus;
    consultantsByInitials: Immutable.Map<string, ConsultantInfo>;
    templateUploadProgress: number;
    templateUploadPending: boolean;
    consultantInfo: ConsultantInfoDTO[];
}

export function emptyAdminState(): AdminState {
    return {
        consultantInfo: [],
        consultantsByInitials: Immutable.Map<string, ConsultantInfo>(),
        loginStatus: LoginStatus.INITIALS,
        requestStatus: RequestStatus.Inactive,
        templateUploadPending: false,
        templateUploadProgress: 0
    }
}
