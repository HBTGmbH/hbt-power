import {APIBuildInfo, BuildInfo} from '../../model/metadata/BuildInfo';
import {ActionType} from '../ActionType';
import {ApplicationState} from '../reducerIndex';
import * as redux from 'redux';
import axios from 'axios';
import {MetaDataStore} from '../../model/metadata/MetaDataStore';
import {ClientBuildInfo} from '../../model/metadata/ClientBuildInfo';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';
import {ClientClient} from '../../clients/ClientClient';
import {AbstractAction} from '../BaseActions';
import {ViewProfileServiceClient} from '../../clients/ViewProfileServiceClient';
import {StatisticsServiceClient} from '../../clients/StatisticsServiceClient';
import {SkillServiceClient} from '../../clients/SkillServiceClient';
import {ReportServiceClient} from '../../clients/ReportServiceClient';
import {ThunkDispatch} from 'redux-thunk';

export interface AddOrReplaceBuildInfoAction extends AbstractAction {
    service: string;
    buildInfo: BuildInfo;
}

export interface AddOrReplaceClientInfoAction extends AbstractAction {
    info: ClientBuildInfo
}


export namespace MetaDataActionCreator {

    const profileServiceClient = ProfileServiceClient.instance();
    const clientClient = new ClientClient();

    export function AddOrReplaceBuildInfo(service: string, buildInfo: BuildInfo): AddOrReplaceBuildInfoAction {
        return {
            type: ActionType.AddOrReplaceBuildInfo,
            service: service,
            buildInfo: buildInfo
        };
    }

    export function AddOrReplaceClientInfo(info: ClientBuildInfo): AddOrReplaceClientInfoAction {
        return {
            type: ActionType.AddOrReplaceClientInfo,
            info: info
        };
    }


    export function FetchBuildInfo(service: string, serviceUrl: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            axios.get(serviceUrl).then(response => {
                let apiBuildInfo = response.data as APIBuildInfo;
                dispatch(AddOrReplaceBuildInfo(service, BuildInfo.of(apiBuildInfo)));
            }).catch(error => {
                console.error(error);
                dispatch(AddOrReplaceBuildInfo(service, BuildInfo.offline(service)));
            });
        };
    }

    const available = (service: string, dispatch: ThunkDispatch<any, any, any>) => {
        return buildInfo => dispatch(AddOrReplaceBuildInfo(service, BuildInfo.of(buildInfo)));
    };

    const notAvailable = (service: string, dispatch: ThunkDispatch<any, any, any>) => {
        return error => dispatch(AddOrReplaceBuildInfo(service, BuildInfo.offline(service)));
    };

    function FetchClientBuildInfo() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            clientClient.getClientBuildInfo()
                .then(value => dispatch(AddOrReplaceClientInfo(value)))
                .catch(error => {
                    console.error(error);
                    dispatch(AddOrReplaceClientInfo(null));
                });
        };
    }

    export function FetchAllBuildInfo() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.getBuildInfo()
                .then(available(MetaDataStore.KEY_PROFILE, dispatch))
                .catch(notAvailable(MetaDataStore.KEY_PROFILE, dispatch));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_STATISTICS, StatisticsServiceClient.instance().getBuildInfoURL()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_SKILL, SkillServiceClient.instance().getBuildInfoURL()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_REPORT, ReportServiceClient.instance().getBuildInfoURL()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_VIEW_PROFILE, ViewProfileServiceClient.instance().getBuildInfoURL()));
            dispatch(FetchClientBuildInfo());
        };
    }
}
