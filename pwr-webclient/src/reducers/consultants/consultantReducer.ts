import {AllConsultantsState} from '../../Store';
import {
    ChangeInfoAction, ChangeInitialsAction, ReceiveConsultantsAction,
    ReceiveSingleConsultantAction
} from './consultant_actions';
import {ConsultantLocalProps, ConsultantProps} from '../../modules/consultant_module';
import {isNullOrUndefined} from 'util';
import {AbstractAction, ActionType} from '../reducerIndex';
import {deepFreeze} from '../../utils/ObjectUtil';


let cons_data: ConsultantProps[] = [];

var log = require('loglevel');
log.info("unreasonably simple");



function handleChangeInitialsAction(action: ChangeInitialsAction, state: AllConsultantsState) : AllConsultantsState {
    let consultants: Array<ConsultantProps> = state.consultants;
    // Creates a copy of the old consultant.
    let updatedConsultant: ConsultantProps = Object.assign(consultants[action.consultantIndex]);
    // Update the initials
    updatedConsultant.initials = action.newInitials;
    // creates a copy of the old consultant array that is then written
    // into the new state.
    let newCList: Array<ConsultantProps>;
    newCList = [
        ...consultants.slice(0, action.consultantIndex),
        updatedConsultant,
        ...consultants.slice(action.consultantIndex + 1)
    ];
    return Object.assign({}, state, {consultants: newCList});
}

function handleChangeFirstnameAction(action: ChangeInfoAction, state: AllConsultantsState) : AllConsultantsState {
    let consultants: Array<ConsultantProps> = state.consultants;
    // Creates a copy of the old consultant.
    let updatedConsultant: ConsultantProps = Object.assign(consultants[action.consultantIndex]);
    // Update the initials
    updatedConsultant.firstName = action.newInfo;
    // creates a copy of the old consultant array that is then written
    // into the new state.
    let newCList: Array<ConsultantProps>;
    newCList = [
        ...consultants.slice(0, action.consultantIndex),
        updatedConsultant,
        ...consultants.slice(action.consultantIndex + 1)
    ];
    return Object.assign({}, state, {consultants: newCList});
}

function handleChangeLastnameAction(action: ChangeInfoAction, state: AllConsultantsState) : AllConsultantsState {
    let consultants: Array<ConsultantProps> = state.consultants;
    // Creates a copy of the old consultant.
    let updatedConsultant: ConsultantProps = Object.assign(consultants[action.consultantIndex]);
    // Update the initials
    updatedConsultant.lastName = action.newInfo;
    // creates a copy of the old consultant array that is then written
    // into the new state.
    let newCList: Array<ConsultantProps>;
    newCList = [
        ...consultants.slice(0, action.consultantIndex),
        updatedConsultant,
        ...consultants.slice(action.consultantIndex + 1)
    ];
    return Object.assign({}, state, {consultants: newCList});
}

function handleReceiveConsultants(action: ReceiveConsultantsAction, state:AllConsultantsState) {
    let newState : AllConsultantsState = Object.assign({}, state, {requestingConsultants: false});
    newState.consultants = action.consultants;
    console.log("Received consultants from API",newState );
    return newState;
}

function handleReceiveSingleConsultant(
    action: ReceiveSingleConsultantAction,
    state: AllConsultantsState) : AllConsultantsState {
    let newState : AllConsultantsState = Object.assign({}, state);
    let newCList: Array<ConsultantProps> = [];
    for(let i: number = 0; i < newState.consultants.length; i++) {
        if (newState.consultants[i].initials === action.consultant.initials) {
            newCList.push(action.consultant);
        } else {
            newCList.push(state.consultants[i]);
        }
    }
    newState.consultants = newCList;


    return newState;
}

function handleRequestConsultantFailed(state: AllConsultantsState) : AllConsultantsState {
    return Object.assign({}, state, {requestingConsultants: false});
}



export function updateConsultant(state : AllConsultantsState, action: AbstractAction) : AllConsultantsState {
    if(isNullOrUndefined(state)) {
        console.log("State was undefined");
        let newState = {
            consultants: cons_data,
            requestingConsultants: false
        };
        console.log("State initialized with: ", newState);
        return newState;
    }
    console.log("Consultant Reducer called for action type " + ActionType[action.type]);
    switch(action.type) {
        case ActionType.RequestConsultantsFailed:
            return handleRequestConsultantFailed(state);
        case ActionType.ReceiveConsultants:
            return handleReceiveConsultants(<ReceiveConsultantsAction> action, state);
        case ActionType.RequestConsultants:
            return Object.assign({}, state, {requestingConsultants: true});
        case ActionType.ChangeInitials:
            return handleChangeInitialsAction(<ChangeInitialsAction> action, state);
        case ActionType.ChangeBirthDate:
            return state;
        case ActionType.ChangeFirstName:
            return handleChangeFirstnameAction(<ChangeInfoAction> action, state);
        case ActionType.ChangeLastName:
            return handleChangeLastnameAction(<ChangeInfoAction> action, state);
        case ActionType.ReceiveSingleConsultant:
            return handleReceiveSingleConsultant(<ReceiveSingleConsultantAction> action, state);
        default:
            return state;
    }
}
