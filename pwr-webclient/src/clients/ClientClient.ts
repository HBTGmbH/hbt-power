import {PowerHttpClient} from './PowerHttpClient';
import {ClientBuildInfo} from '../model/metadata/ClientBuildInfo';
import axios from 'axios';

// Defined in config.js
declare const CLIENT_BUILD_INFO_LOCATION: string;

export class ClientClient extends PowerHttpClient {

    public getClientBuildInfo = (): Promise<ClientBuildInfo> => {
        return axios.get<ClientBuildInfo>(CLIENT_BUILD_INFO_LOCATION)
            .then(response => response.data)
    }

}
