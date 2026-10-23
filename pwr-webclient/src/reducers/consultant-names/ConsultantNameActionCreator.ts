import {ThunkDispatch} from 'redux-thunk';
import {ActionType} from '../ActionType';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';
import {ConsultantName} from '../../model/ConsultantName';
import {ReceiveConsultantNamesAction} from './ConsultantNameReducer';
import {ApplicationState} from '../reducerIndex';

/**
 * Loads the names of all consultants (#216). Quietly: without them the app shows the full names
 */
export function loadConsultantNames() {
    return function (dispatch: ThunkDispatch<any, any, any>) {
        dispatch({type: ActionType.RequestConsultantNames});
        ProfileServiceClient.instance().getConsultantNames()
            .then(names => dispatch({type: ActionType.ReceiveConsultantNames, names} as ReceiveConsultantNamesAction))
            .catch(console.error);
    };
}

/**
 * The name of the consultant with these initials, undefined if the app does not know it (yet)
 */
export function selectConsultantName(state: ApplicationState, initials: string): ConsultantName | undefined {
    return initials ? state.consultantNames.names[initials] : undefined;
}
