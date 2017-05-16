export class OAuth2Authenticator {

    protected clientId: string;
    protected authUrl: string;
    protected readonly tokenUrl: string = "/token";



    protected constructor(clientId: string, authUrl: string) {
        this.clientId = clientId;
        this.authUrl = authUrl;
    }

}