import {
    ACTION_REQUEST_CONSULTANTS,
    ACTION_TYPE_CHANGE_BIRTHDATE,
    ACTION_TYPE_CHANGE_FIRSTNAME, ACTION_TYPE_CHANGE_INITIALS,
    ACTION_TYPE_CHANGE_LASTNAME,
    ACTION_TYPE_RECEIVE_CONSULTANTS
} from './actions/actionTypes';
import {ConsultantProps} from './consultant_module';
import {PowerClientState} from './Store';
import * as redux from 'redux';
import axios from 'axios';


const API_PREFIX = `http://localhost:8080/api`;
const API_SUFFIX_CONSULTANTS = '/consultants';

export enum ActionType {
    ReceiveSingleConsultant,
    ChangeInitials,
    ChangeFirstName,
    ChangeLastName,
    ChangeBirthDate,
    RequestConsultants,
    ReceiveConsultants
}




export interface AbstractAction {
    type: ActionType;
}

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
        return function (dispatch: redux.Dispatch<PowerClientState>) {
            dispatch(ActionCreator.requestAllConsultants());

            return axios.get(API_PREFIX + API_SUFFIX_CONSULTANTS).then(function (response) {
                console.log(response);
                dispatch(ActionCreator.receiveAllConsultants(response.data));
            });

        }
    }

    static fetchSingleConsultant(initials: string) {
        return function(dispatch: redux.Dispatch<PowerClientState>) {
            return axios.get(API_PREFIX + API_SUFFIX_CONSULTANTS + "/" + initials).then(function(response) {
                console.log("Response fetchSingleConsultant", response);
                dispatch(ActionCreator.receiveSingleConsultant(response.data));
            })
        }
    }

    static saveSingleConsultant(consultant: ConsultantProps) {
        return function(dispatch: redux.Dispatch<PowerClientState>) {
            return axios.put(API_PREFIX + API_SUFFIX_CONSULTANTS + "/" + consultant.initials).then(function(response) {
                console.log("Response saveSingleConsultant", response);
                dispatch(ActionCreator.receiveSingleConsultant(response.data));
            })
        }
    }
}
