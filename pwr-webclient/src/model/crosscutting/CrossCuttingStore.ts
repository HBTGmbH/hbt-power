import {LoginStatus} from '../LoginStatus';

export interface CrossCuttingStore {
    requestPending: boolean;
    loginStatus: LoginStatus;
    loginError: string;
}

export const empty: CrossCuttingStore = {
    requestPending: false,
    loginStatus: LoginStatus.INITIALS,
    loginError: ''
};
