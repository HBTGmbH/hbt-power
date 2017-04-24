import {ConsultantProps} from '../../modules/consultant_module';
import {AllConsultantsState} from '../../Store';
import * as redux from 'redux';
import axios from 'axios';
import {AbstractAction, ActionType} from '../reducerIndex';


const API_PREFIX = `http://localhost:8080/api`;
const API_SUFFIX_CONSULTANTS = '/consultants';

const REQ_HEADERS  = {
    "headers" : {
        "Content-Type": "application/json"
    }
};






export interface ChangeInitialsAction extends AbstractAction {
    newInitials: string;
    consultantIndex: number;
}

export interface ChangeInfoAction extends AbstractAction {
    newInfo: string;
    consultantIndex: number;
}

export interface ReceiveConsultantsAction extends AbstractAction {
    consultants: ConsultantProps[];
}

export interface ReceiveSingleConsultantAction extends AbstractAction {
    consultant: ConsultantProps;
}

export class ActionCreator {
    static changeInitials(newInitials: string, consultantIndex: number) : ChangeInitialsAction {
        return {
            type: ActionType.ChangeInitials,
            newInitials: newInitials,
            consultantIndex: consultantIndex
        }
    }

    static changeFirstname(newFirstname: string, consultantIndex: number) : ChangeInfoAction {
        return {
            type: ActionType.ChangeFirstName,
            newInfo: newFirstname,
            consultantIndex: consultantIndex
        }
    }

    static changeLastname(newLastname: string, consultantIndex: number) : ChangeInfoAction {
        return {
            type: ActionType.ChangeLastName,
            newInfo: newLastname,
            consultantIndex: consultantIndex
        }
    }

    static changeBirthdate(newBirthdate: string, consultantIndex: number) : ChangeInfoAction {
        return {
            type: ActionType.ChangeLastName,
            newInfo: newBirthdate,
            consultantIndex: consultantIndex
        }
    }

    static requestAllConsultants() : AbstractAction {
        return {
            type: ActionType.RequestConsultants
        }
    }

    static requestAllConsultantsFailed() : AbstractAction {
        return {
            type: null //FIXME
        }
    }

    static receiveAllConsultants(consultants: ConsultantProps[]) : ReceiveConsultantsAction {
        return {
            type: ActionType.ReceiveConsultants,
            consultants: consultants
        }
    }

    static receiveSingleConsultant(consultant: ConsultantProps) : ReceiveSingleConsultantAction {
        return {
            type: ActionType.ReceiveSingleConsultant,
            // Path of the new consultant relative to the API
            consultant: consultant
        }
    }


}

export class AsyncActions {
    static fetchConsultants() {
        return function (dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ActionCreator.requestAllConsultants());

            return axios.get(API_PREFIX + API_SUFFIX_CONSULTANTS, REQ_HEADERS).then(function (response) {
                console.log(response);
                dispatch(ActionCreator.receiveAllConsultants(response.data));
            }).catch(function(error: any) {
                console.error(error);
                dispatch(ActionCreator.requestAllConsultantsFailed());
            });

        }
    }

    static fetchSingleConsultant(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            return axios.get(API_PREFIX + API_SUFFIX_CONSULTANTS + "/" + initials, REQ_HEADERS).then(function(response) {
                dispatch(ActionCreator.receiveSingleConsultant(response.data));
            })
            //FIXME error treatment with state modification
        }
    }

    static saveSingleConsultant(consultant: ConsultantProps) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            let apiString : string = API_PREFIX + API_SUFFIX_CONSULTANTS + "/" + consultant.initials;

            console.log("Sending PUT Request to " + apiString + " with consultant: ", consultant);
            return axios.put(apiString, consultant, REQ_HEADERS).then(function(response) {
                console.log("Response saveSingleConsultant", response);
                dispatch(ActionCreator.receiveSingleConsultant(response.data));
            }).catch(function(error:any) {
                console.log("Error saving single consultant:", error);
                //FIXME state modification to represent the error
            });
        }
    }
}
