import {APIBuildInfo, BuildInfo, ofAPIBuildInfo, offlineBuildInfo} from '../../model/metadata/BuildInfo';
import {ActionType} from '../ActionType';
import axios from 'axios';
import {MetaDataStore, MetaDataStoreKeys} from '../../model/metadata/MetaDataStore';
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
                dispatch(AddOrReplaceBuildInfo(service, ofAPIBuildInfo(apiBuildInfo)));
            }).catch(error => {
                console.error(error);
                dispatch(AddOrReplaceBuildInfo(service, offlineBuildInfo(service)));
            });
        };
    }

    const available = (service: string, dispatch: ThunkDispatch<any, any, any>) => {
        return buildInfo => dispatch(AddOrReplaceBuildInfo(service, ofAPIBuildInfo(buildInfo)));
    };

    const notAvailable = (service: string, dispatch: ThunkDispatch<any, any, any>) => {
        return error => dispatch(AddOrReplaceBuildInfo(service, offlineBuildInfo(service)));
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
                .then(available(MetaDataStoreKeys.KEY_PROFILE, dispatch))
                .catch(notAvailable(MetaDataStoreKeys.KEY_PROFILE, dispatch));
            SkillServiceClient.instance().getBuildInfo()
                .then(available(MetaDataStoreKeys.KEY_SKILL, dispatch))
                .catch(notAvailable(MetaDataStoreKeys.KEY_SKILL, dispatch));
            ViewProfileServiceClient.instance().getBuildInfo()
                .then(available(MetaDataStoreKeys.KEY_VIEW_PROFILE, dispatch))
                .catch(notAvailable(MetaDataStoreKeys.KEY_VIEW_PROFILE, dispatch));
            dispatch(FetchBuildInfo(MetaDataStoreKeys.KEY_STATISTICS, StatisticsServiceClient.instance().getBuildInfoURL()));
            dispatch(FetchBuildInfo(MetaDataStoreKeys.KEY_REPORT, ReportServiceClient.instance().getBuildInfoURL()));
            dispatch(FetchClientBuildInfo());
        };
    }
}
