import * as redux from 'redux';
import {ConsultantClient} from './ConsultantClient';
import {ApplicationState} from '../../reducerIndex';
import {consultantUpdateAction} from './actions/ConsultantUpdateAction';
import {Alerts} from '../../../utils/Alerts';

const client = ConsultantClient.instance();

const handleError = (error: any) => {
    Alerts.showError(error.status + ' -- ' + error.message);
    console.error(error);
};

export class ConsultantAsyncActionCreator {


    public static getConsultant(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getConsultant(initials)
                .then(value => {
                    dispatch(consultantUpdateAction(value));
                })
                .catch(handleError);
        };
    }
}
