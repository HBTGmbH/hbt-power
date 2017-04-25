import {updateConsultant} from './consultants/consultantReducer';
import {combineReducers} from 'redux';
import {databaseReducer} from './singleProfile/singleProfileReducer';
/**
 * Created by nt on 12.04.2017.
 */

export enum ActionType {
    ChangeDate,
    APIRequestSuccess,
    APIRequestFail,
    APIRequestPending,
    ChangeLanguageSkillLevel,
    ReceiveSingleConsultant,
    ChangeInitials,
    ChangeFirstName,
    ChangeLastName,
    ChangeBirthDate,
    RequestConsultants,
    ReceiveConsultants,
    // == Single ConsultantProfile Actions == //
    ChangeAbstract,
    ChangeLanguageSkillName
}


export interface AbstractAction {
    type: ActionType;
}


const ApplicationStore = combineReducers({
    updateConsultant,
    databaseReducer
});



export default ApplicationStore;