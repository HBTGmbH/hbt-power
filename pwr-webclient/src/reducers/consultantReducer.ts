import {PowerClientState} from '../Store';
import {
    AbstractAction, ActionType, ChangeInfoAction, ChangeInitialsAction, ReceiveConsultantsAction,
    ReceiveSingleConsultantAction
} from '../actions';
import {ConsultantLocalProps, ConsultantProps} from '../consultant_module';
import {isNullOrUndefined} from 'util';
/**
 * Created by nt on 12.04.2017.
 */


let cons_data: ConsultantProps[] = [];

// Um obj vollständig unveränderbar zu machen, friere jedes Objekt in obj ein.
function deepFreeze(obj: Object) {

    // Ermittle die Namen der für obj definierten Eigenschaften
    var propNames = Object.getOwnPropertyNames(obj);

    // Friere die Eigenschaften ein, bevor obj selbst eingefroren wird
    propNames.forEach(function(name) {
        var prop = obj[name];

        // Friere prop ein wenn es ein Objekt ist
        if (typeof prop == 'object' && prop !== null)
            deepFreeze(prop);
    });

    // Friere obj selbst ein
    return Object.freeze(obj);
}

function handleChangeInitialsAction(action: ChangeInitialsAction, state: PowerClientState) : PowerClientState {
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

function handleChangeFirstnameAction(action: ChangeInfoAction, state: PowerClientState) : PowerClientState {
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

function handleChangeLastnameAction(action: ChangeInfoAction, state: PowerClientState) : PowerClientState {
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

function handleReceiveConsultants(action: ReceiveConsultantsAction, state:PowerClientState) {
    let newState : PowerClientState = Object.assign({}, state);
    newState.consultants = action.consultants;
    console.log("Received consultants from API",newState );
    return newState;
}

function handleReceiveSingleConsultant(
    action: ReceiveSingleConsultantAction,
    state: PowerClientState) : PowerClientState {
    deepFreeze(state); //FIXME remove
    let newState : PowerClientState = Object.assign({}, state);
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



export function updateConsultant(state : PowerClientState, action: AbstractAction) : PowerClientState {
    if(isNullOrUndefined(state)) {
        console.log("State was undefined");
        let newState = {
            consultants: cons_data
        };
        console.log("State initialized with: ", newState);
        return newState;
    }
    console.log("Reducer called with state actiontype", ActionType[action.type]);
    switch(action.type) {
        case ActionType.ReceiveConsultants:
            return handleReceiveConsultants(<ReceiveConsultantsAction> action, state);
        case ActionType.RequestConsultants:
            return state;
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
