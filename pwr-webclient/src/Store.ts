import {ConsultantLocalProps, ConsultantProps} from './modules/consultant_module';
import {Profile} from './model/Profile';
import {CareerPosition} from './model/CareerPosition';
import {CareerElement} from './model/CareerElement';
import {normalize, schema} from 'normalizr';
import {Sector} from './model/Sector';
import {Language} from './model/Language';

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

    /**
     * Indicates the current state of the get profile request that has been sent to the API. Used
     * to indicate the status to the user.
     */
    requestProfileStatus: RequestStatus;
    /**
     * Indicates the current state of the save profile request that has been sent to the API. Used
     * to indicate the status to the user.
     */
    saveProfileStatus: RequestStatus;

    possibleSectors: Array<Sector>;
    possibleLanguageNames: Array<Language>;
    possibleLanguageLevels: Array<string>;

}

export interface ApplicationState {
    updateConsultant: AllConsultantsState;
    singleProfile: SingleProfile;
}

