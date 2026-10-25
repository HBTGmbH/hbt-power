import {LoginStatus} from '../LoginStatus';

export interface CrossCuttingStore {
    requestPending: boolean;
    /** Requests saving small changes without the loading overlay (#149), see PowerHttpClient.patchInBackground */
    backgroundRequests: number;
    /** The SessionExpiredDialog is open: requests wait for a new login (#323), see OIDCService.getToken */
    sessionExpiredDialogOpen: boolean;
    loginStatus: LoginStatus;
    loginError: string;
}

export const empty: CrossCuttingStore = {
    requestPending: false,
    backgroundRequests: 0,
    sessionExpiredDialogOpen: false,
    loginStatus: LoginStatus.INITIALS,
    loginError: ''
};
