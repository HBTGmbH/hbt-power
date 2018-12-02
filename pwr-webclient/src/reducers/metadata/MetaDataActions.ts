import {APIBuildInfo, BuildInfo} from '../../model/metadata/BuildInfo';
import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {ApplicationState} from '../reducerIndex';
import * as redux from 'redux';
import axios from 'axios';
import {MetaDataStore} from '../../model/metadata/MetaDataStore';
import {
    getApiPrefix,
    getReportBuildInfo,
    getSkillBuildInfo,
    getStatisticsBuildsInfo,
    ViewProfileService
} from '../../API_CONFIG';
import {ClientBuildInfo} from '../../model/metadata/ClientBuildInfo';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';

export interface AddOrReplaceBuildInfoAction extends AbstractAction {
    service: string;
    buildInfo: BuildInfo;
}

export interface AddOrReplaceClientInfoAction extends AbstractAction {
    info: ClientBuildInfo
}



export namespace MetaDataActionCreator {

    const profileServiceClient = ProfileServiceClient.instance();

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
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(serviceUrl).then(response => {
                let apiBuildInfo = response.data as APIBuildInfo;
                dispatch(AddOrReplaceBuildInfo(service, BuildInfo.of(apiBuildInfo)));
            }).catch(error => {
                console.error(error);
                dispatch(AddOrReplaceBuildInfo(service, BuildInfo.offline(service)));
            });
        };
    }

    const available = (service: string, dispatch: redux.Dispatch<ApplicationState>) => {
        return buildInfo => dispatch(AddOrReplaceBuildInfo(service, BuildInfo.of(buildInfo)))
    };

    const notAvailable = (service: string, dispatch: redux.Dispatch<ApplicationState>) => {
        return error => dispatch(AddOrReplaceBuildInfo(service, BuildInfo.offline(service)));
    };

    function FetchClientBuildInfo() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getApiPrefix() + '/build_info.json').then(response => {
                if (response.data != null) {
                    dispatch(AddOrReplaceClientInfo(response.data));
                } else {
                    dispatch(AddOrReplaceClientInfo(null));
                }
            }).catch(error => {
                console.error(error);
                dispatch(AddOrReplaceClientInfo(null));
            });
        };
    }

    export function FetchAllBuildInfo() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getBuildInfo()
                .then(available(MetaDataStore.KEY_PROFILE, dispatch))
                .catch(notAvailable(MetaDataStore.KEY_PROFILE, dispatch));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_STATISTICS, getStatisticsBuildsInfo()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_SKILL, getSkillBuildInfo()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_REPORT, getReportBuildInfo()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_VIEW_PROFIE, ViewProfileService.getBuildInfo()));
            dispatch(FetchClientBuildInfo());
        };
    }
}