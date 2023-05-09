import axios, {AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import {store} from '../reducers/reducerIndex';
import {CrossCuttingActionCreator} from '../reducers/crosscutting/CrossCuttingActionCreator';
import {Alerts} from '../utils/Alerts';
import {OIDCService} from '../OIDCService';

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



    constructor() {

    }

    get<T, R>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.getAxios().then(client => this.executeRequest(client.get(url, config)));
    }

    delete<T, R>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.getAxios().then(client => this.executeRequest(client.delete(url, config)));
    }

    head<T, R>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.getAxios().then(client => this.executeRequest(client.head(url, config)));
    }

    post<T, R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.getAxios().then(client => this.executeRequest(client.post(url, data, config)));
    }

    put<T, R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.getAxios().then(client => this.executeRequest(client.put(url, data, config)));
    }

    patch<T, R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.getAxios().then(client => this.executeRequest(client.patch(url, data, config)));
    }

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

    /**
     * Takes an axios promise (which represents a request) and executes it.
     * If the request is successful, metadata is discarded and only the entity is returned
     * If the request has an error, a default notification is posted to the user and the error is rethrown (allowing you to react to it if you wish to)
     * @param promise
     */
    private executeRequest = <T>(promise: AxiosPromise<T>): Promise<T> => {
        return promise
            .then(this.endRequest)
            .catch(this.errorRequest);
    };

    private determineError = (error: AxiosError): PowerApiError => {
        if ((error as any).status === 403) {
            return {
                status: 403,
                message: 'Unzureichende Berechtigung',
                error: 'Forbidden'
            };
        }
        if ((error as any).status === 401) {
            return {
                status: 403,
                message: 'Fehlende Autorisierung',
                error: 'Unauthorized'
            };
        }
        if (!error.response) {
            console.error('Intercepted client error', error);
            if (error.message && error.message === 'Network Error') {
                return {status: -1, message: 'One or more services are not reachable!', error: error.message};
            } else {
                return {
                    status: -1,
                    message: 'Error in Power Client Library occurred. Please contact a developer',
                    error: error.code
                };
            }
        }
        if (!error.response.data) {
            console.error('Intercepted server error', error.response);
            return {
                status: error.response.status,
                message: 'An unknown server error occurred',
                error: error.response.statusText
            };
        }
        console.error('Intercepted api error', error.response.data, error.response);
        return this.extractApiError(error);
    };


    private handleError = (error: AxiosError): PowerApiError => {
        const apiError = this.determineError(error);
        const message = apiError.error + ': ' + apiError.message;
        Alerts.showError(message);
        return apiError;
    };

    private getAxios = (): Promise<AxiosInstance> => {
        return OIDCService.instance().getToken()
            .then(token => axios.create({headers: {Authorization: 'Bearer '+ token}, withCredentials: true}))
    }
}
