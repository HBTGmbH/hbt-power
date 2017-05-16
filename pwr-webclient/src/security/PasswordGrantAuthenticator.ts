import {OAuth2Authenticator} from './OAuth2Authenticator';
import axios, {AxiosResponse} from 'axios';
export class PasswordGrantAuthenticator extends OAuth2Authenticator {

    constructor(clientId: string, authUrl: string) {
        super(clientId, authUrl);
    }

    /**
     * Performs a password grant request and returns a key.
     * @param username
     * @param password
     * @returns {string}
     */
    grant(username: string, password: string): string {
        let res: string = "";
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('username', 'power');
        params.append('password', 'power');
        axios.post(this.authUrl + this.tokenUrl, params).then((result: any) => {
            console.log(result);
        }).catch((error: any) => {
            console.log(error);
        });
        return res;
    }
}