import {updateConsultant} from './consultants/consultantReducer';
import {combineReducers} from 'redux';
import {databaseReducer} from './singleProfile/database-reducer';
/**
 * Created by nt on 12.04.2017.
 */

export enum ActionType {
    ChangeItemId,
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
    ChangeAbstract
}


export interface AbstractAction {
    type: ActionType;
}


const ApplicationStore = combineReducers({
    updateConsultant,
    databaseReducer
});



export default ApplicationStore;