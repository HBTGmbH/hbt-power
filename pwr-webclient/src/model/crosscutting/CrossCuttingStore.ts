import {LoginStatus} from '../LoginStatus';

export interface CrossCuttingStore {
    /** Requests still running (#320), see PowerHttpClient.counted, shown by PwrRequestProgress */
    pendingRequests: number;
    /** The SessionExpiredDialog is open: requests wait for a new login (#323), see OIDCService.getToken */
    sessionExpiredDialogOpen: boolean;
    loginStatus: LoginStatus;
    loginError: string;
}

export const empty: CrossCuttingStore = {
    pendingRequests: 0,
    sessionExpiredDialogOpen: false,
    loginStatus: LoginStatus.INITIALS,
    loginError: ''
};
