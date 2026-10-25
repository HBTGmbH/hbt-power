import axios, {AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import {store} from '../reducers/reducerIndex';
import {CrossCuttingActionCreator} from '../reducers/crosscutting/CrossCuttingActionCreator';
import {Alerts} from '../utils/Alerts';
import {LoginNotCompletedError, OIDCService} from '../OIDCService';
import {AuthError} from '@azure/msal-browser';
import {PowerLocalize} from '../localization/PowerLocalizer';

/**
 * A general API error. All services conform to this error.
 *
 * These are errors that should not happen. They are displayed as UI notification.
 */
export interface PowerApiError {
    status: number;
    error: string;
    message: string;
    /** Already shown once for all requests that waited for a new login which didn't happen: nobody shows it (#323) */
    silent?: boolean;
}

/**
 * General HTTP Client that covers centralized error handling.
 */
export class PowerHttpClient {


    get<R>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.executeRequest(this.getAxios().then(client => client.get(url, config)));
    }

    /**
     * Like get, but "not found" is an expected answer: resolves with null instead of showing an error
     */
    getOrNull<R>(url: string, config?: AxiosRequestConfig): Promise<R | null> {
        const notFoundIsAnAnswer = (status: number) => (status >= 200 && status < 300) || status === 404;
        return this.executeRequest<R | null>(this.getAxios().then(client =>
            client.get<R>(url, {...config, validateStatus: notFoundIsAnAnswer})
                .then(response => response.status === 404 ? {...response, data: null} : response) as AxiosPromise<R | null>));
    }

    /**
     * Like get, but the given error statuses are expected answers the caller shows itself: no error alert, the promise
     * rejects with a {@link PowerApiError} carrying the status
     */
    getExpecting<R>(url: string, expectedStatuses: Array<number>, config?: AxiosRequestConfig): Promise<R> {
        const isAnswer = (status: number) => (status >= 200 && status < 300) || expectedStatuses.includes(status);
        return this.executeRequest<AxiosResponse<R>>(this.getAxios().then(client =>
            client.get<R>(url, {...config, validateStatus: isAnswer})
                .then(response => ({...response, data: response})) as AxiosPromise<AxiosResponse<R>>))
            .then(response => {
                if (expectedStatuses.includes(response.status)) {
                    const expected: PowerApiError = {status: response.status, error: response.statusText, message: ''};
                    throw expected;
                }
                return response.data;
            });
    }

    /**
     * Like get, but without error alert: for background information whose absence the caller
     * shows itself
     */
    getQuietly<R>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return PowerHttpClient.counted(this.getAxios()
            .then(client => client.get<R>(url, config))
            .then(response => response.data));
    }

    /**
     * Like post, but without error alert: for background information the caller shows itself
     */
    postQuietly<R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return PowerHttpClient.counted(this.getAxios()
            .then(client => client.post<R>(url, data, config))
            .then(response => response.data));
    }

    delete<R>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.executeRequest(this.getAxios().then(client => client.delete(url, config)));
    }

    head<R>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.executeRequest(this.getAxios().then(client => client.head(url, config)));
    }

    post<R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.executeRequest(this.getAxios().then(client => client.post(url, data, config)));
    }

    /**
     * Like post, but the given error statuses are expected answers the caller shows itself: no error alert, the promise
     * rejects with a {@link PowerApiError} carrying the status and the message from the response body
     */
    postExpecting<R>(url: string, expectedStatuses: Array<number>, data?: any, config?: AxiosRequestConfig): Promise<R> {
        const isAnswer = (status: number) => (status >= 200 && status < 300) || expectedStatuses.includes(status);
        return this.executeRequest<AxiosResponse<R>>(this.getAxios().then(client =>
            client.post<R>(url, data, {...config, validateStatus: isAnswer})
                .then(response => ({...response, data: response})) as AxiosPromise<AxiosResponse<R>>))
            .then(response => {
                if (expectedStatuses.includes(response.status)) {
                    const body: any = response.data;
                    const expected: PowerApiError = {
                        status: response.status,
                        error: response.statusText,
                        message: (body && body.message) || ''
                    };
                    throw expected;
                }
                return response.data;
            });
    }

    put<R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.executeRequest(this.getAxios().then(client => client.put(url, data, config)));
    }

    patch<R>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.executeRequest(this.getAxios().then(client => client.patch(url, data, config)));
    }

    /**
     * Overwrite this method if a client does not conform to the {@link PowerApiError] interface
     */
    extractApiError = (error: AxiosError): PowerApiError => {
        const data: any = error.response.data;
        // The view-profile service answers {error: {code, message, …}} (#221)
        if (data.error !== null && typeof data.error === 'object') {
            return {status: error.response.status, error: data.error.code, message: data.error.message};
        }
        // The skill service answers {id, errorType, message} (#252)
        if (typeof data.errorType === 'string') {
            return {status: error.response.status, error: data.errorType, message: data.message};
        }
        return data;
    };

    /**
     * Takes an axios promise (which represents a request) and executes it.
     * If the request is successful, metadata is discarded and only the entity is returned
     * If the request has an error, a default notification is posted to the user and the error is rethrown (allowing you to react to it if you wish to)
     * The promise includes getting the token, so a failure there ends the request and is shown too (#311)
     * @param promise
     */
    private executeRequest = <T>(promise: AxiosPromise<T>): Promise<T> => {
        return PowerHttpClient.counted(promise
            .then(response => response.data)
            .catch(error => {
                throw this.handleError(error);
            }));
    };

    /**
     * Every request counts while it runs (#320): the thin bar below the app bar shows it (PwrRequestProgress), on
     * every page and without getting in the way of the next click
     */
    private static counted<T>(request: Promise<T>): Promise<T> {
        store.dispatch(CrossCuttingActionCreator.startRequest());
        return request.finally(() => store.dispatch(CrossCuttingActionCreator.endRequest()));
    }

    private determineError = (error: AxiosError): PowerApiError => {
        if ((error as any) instanceof LoginNotCompletedError) {
            return {status: -1, message: PowerLocalize.get('SessionExpired.Cancelled'), error: 'Login', silent: true};
        }
        if ((error as any) instanceof AuthError) {
            // No token, so no request was sent (#311)
            return {status: -1, message: PowerLocalize.get('Login.TokenFailed'), error: 'Login'};
        }
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
        // Requests with responseType 'blob' get their error body as a Blob as well, and a proxy in front of a service
        // that doesn't answer sends text or HTML
        const data = error.response.data;
        if (!data || typeof data !== 'object' || data instanceof Blob) {
            console.error('Intercepted server error', error.response);
            return {
                status: error.response.status,
                message: 'An unknown server error occurred',
                error: error.response.statusText || String(error.response.status)
            };
        }
        console.error('Intercepted api error', error.response.data, error.response);
        return this.extractApiError(error);
    };


    private handleError = (error: AxiosError): PowerApiError => {
        const apiError = this.determineError(error);
        if (!apiError.silent) {
            Alerts.showError(apiError.error + ': ' + apiError.message);
        }
        return apiError;
    };

    private getAxios = (): Promise<AxiosInstance> => {
        return OIDCService.instance().getToken()
            .then(token => axios.create({headers: token ? {Authorization: 'Bearer '+ token} : {}, withCredentials: true}))
    }
}
