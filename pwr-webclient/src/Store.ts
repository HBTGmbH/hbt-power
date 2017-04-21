import {ConsultantLocalProps, ConsultantProps} from './modules/consultant_module';
import {Profile} from './model/Profile';

/**
 * State encapsulating all consultants.
 */
export interface AllConsultantsState {
    consultants: Array<ConsultantProps>;
    requestingConsultants: boolean;
}

export enum RequestStatus {
    Pending,
    Successful,
    Failiure
}
/**
 * State for a single consultant profile.
 */
export interface SingleProfile {
    profile: Profile;

    requestProfileStatus: RequestStatus;

    possibleSectors: string[]
    possibleLanguageNames: string[];
    possibleLanguageLevels: Array<string>;

}

export interface ApplicationState {
    updateConsultant: AllConsultantsState;
    singleProfile: SingleProfile;
}

