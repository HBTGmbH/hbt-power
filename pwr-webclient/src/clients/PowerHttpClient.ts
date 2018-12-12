import {AxiosError, AxiosPromise, AxiosResponse} from 'axios';
import {store} from '../reducers/reducerIndex';
import {CrossCuttingActionCreator} from '../reducers/crosscutting/CrossCuttingActionCreator';
import {NavigationActionCreator} from '../reducers/navigation/NavigationActionCreator';
import {Promise} from 'es6-promise';

/**
 * A general API error. All services conform to this error.
 *
 * These are errors that should not happen. They are displayed as UI notification.
 */
export interface PowerApiError {
    status: number;
    error: string;
    message: string;
}

/**
 * General HTTP Client that covers centralized error handling.
 */
export class PowerHttpClient {

    /**
     * Overwrite this method if a client does not conform to the {@link PowerApiError] interface
     */
    extractApiError = (error: AxiosError): PowerApiError => {
        return error.response.data;
    };

    /**
     * Override this if you want to change the behavior of request beginning
     */
    beginRequest = () => {
        //console.log(store.getState().adminReducer.adminPass());
        store.dispatch(CrossCuttingActionCreator.startRequest());
    };

    endRequest = <T>(response: AxiosResponse<T>): T => {
        store.dispatch(CrossCuttingActionCreator.endRequest());
        return response.data;
    };

    errorRequest = <T>(error: AxiosError): any => {
        store.dispatch(CrossCuttingActionCreator.endRequest());
        throw(this.handleError(error));
    };

    preProcess = <T>(promise: AxiosPromise<T>): Promise<T> => {
        return promise
            .then(this.endRequest)
            .catch(this.errorRequest)
    };

    private determineError = (error: AxiosError): PowerApiError  => {
        if (!error.response) {
            console.error("Intercepted client error", error);
            return {status: -1, message: "Error in Power Client Library occurred. Please contact a developer", error: error.code}
        }
        if (!error.response.data) {
            console.error("Intercepted server error", error.response);
            return {status: error.response.status, message: "An unknown server error occurred", error: error.response.statusText}
        }
        console.error("Intercepted api error", error.response.data, error.response);
        return this.extractApiError(error);
    };


    private handleError = (error: AxiosError): PowerApiError => {
        const apiError = this.determineError(error);
        const message = apiError.error + ": " + apiError.message;
        NavigationActionCreator.showError(message);
        return apiError;
    }
}