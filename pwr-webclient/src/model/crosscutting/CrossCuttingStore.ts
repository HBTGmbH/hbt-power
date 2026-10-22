import {LoginStatus} from '../LoginStatus';

export interface CrossCuttingStore {
    requestPending: boolean;
    /** Requests saving small changes without the loading overlay (#149), see PowerHttpClient.patchInBackground */
    backgroundRequests: number;
    loginStatus: LoginStatus;
    loginError: string;
}

export const empty: CrossCuttingStore = {
    requestPending: false,
    backgroundRequests: 0,
    loginStatus: LoginStatus.INITIALS,
    loginError: ''
};
