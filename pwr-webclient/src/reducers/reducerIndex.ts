import {updateConsultant} from './consultants/consultantReducer';
import {combineReducers} from 'redux';
import {singleProfile} from './singleProfile/singleProfileReducer';
/**
 * Created by nt on 12.04.2017.
 */

export enum ActionType {
    FailRequestFullProfile,
    ReceiveFullProfile,
    RequestingFullProfile,
    RequestConsultantsFailed,
    ReceiveSingleConsultant,
    ChangeInitials,
    ChangeFirstName,
    ChangeLastName,
    ChangeBirthDate,
    RequestConsultants,
    ReceiveConsultants,
    // == Single Profile Actions == //
    ChangeAbstract,
    ChangeLanguageSkill
}


export interface AbstractAction {
    type: ActionType;
}


const ApplicationStore = combineReducers({
    updateConsultant,
    singleProfile
});



export default ApplicationStore;