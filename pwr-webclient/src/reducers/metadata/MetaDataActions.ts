import {APIBuildInfo, BuildInfo, ofAPIBuildInfo, offlineBuildInfo} from '../../model/metadata/BuildInfo';
import {ActionType} from '../ActionType';
import axios from 'axios';
import {MetaDataStoreKeys} from '../../model/metadata/MetaDataStore';
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


export class MetaDataActionCreator {

    private static readonly profileServiceClient = ProfileServiceClient.instance();
    private static readonly clientClient = new ClientClient();

    public static AddOrReplaceBuildInfo(service: string, buildInfo: BuildInfo): AddOrReplaceBuildInfoAction {
        return {
            type: ActionType.AddOrReplaceBuildInfo,
            service: service,
            buildInfo: buildInfo
        };
    }

    public static AddOrReplaceClientInfo(info: ClientBuildInfo): AddOrReplaceClientInfoAction {
        return {
            type: ActionType.AddOrReplaceClientInfo,
            info: info
        };
    }


    public static FetchBuildInfo(service: string, serviceUrl: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            axios.get(serviceUrl).then(response => {
                let apiBuildInfo = response.data as APIBuildInfo;
                dispatch(MetaDataActionCreator.AddOrReplaceBuildInfo(service, ofAPIBuildInfo(apiBuildInfo)));
            }).catch(error => {
                console.error(error);
                dispatch(MetaDataActionCreator.AddOrReplaceBuildInfo(service, offlineBuildInfo(service)));
            });
        };
    }

    private static available = (service: string, dispatch: ThunkDispatch<any, any, any>) => {
        return buildInfo => dispatch(MetaDataActionCreator.AddOrReplaceBuildInfo(service, ofAPIBuildInfo(buildInfo)));
    };

    private static notAvailable = (service: string, dispatch: ThunkDispatch<any, any, any>) => {
        return error => dispatch(MetaDataActionCreator.AddOrReplaceBuildInfo(service, offlineBuildInfo(service)));
    };

    private static FetchClientBuildInfo() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            MetaDataActionCreator.clientClient.getClientBuildInfo()
                .then(value => dispatch(MetaDataActionCreator.AddOrReplaceClientInfo(value)))
                .catch(error => {
                    console.error(error);
                    dispatch(MetaDataActionCreator.AddOrReplaceClientInfo(null));
                });
        };
    }

    public static FetchAllBuildInfo() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            MetaDataActionCreator.profileServiceClient.getBuildInfo()
                .then(MetaDataActionCreator.available(MetaDataStoreKeys.KEY_PROFILE, dispatch))
                .catch(MetaDataActionCreator.notAvailable(MetaDataStoreKeys.KEY_PROFILE, dispatch));
            SkillServiceClient.instance().getBuildInfo()
                .then(MetaDataActionCreator.available(MetaDataStoreKeys.KEY_SKILL, dispatch))
                .catch(MetaDataActionCreator.notAvailable(MetaDataStoreKeys.KEY_SKILL, dispatch));
            ViewProfileServiceClient.instance().getBuildInfo()
                .then(MetaDataActionCreator.available(MetaDataStoreKeys.KEY_VIEW_PROFILE, dispatch))
                .catch(MetaDataActionCreator.notAvailable(MetaDataStoreKeys.KEY_VIEW_PROFILE, dispatch));
            dispatch(MetaDataActionCreator.FetchBuildInfo(MetaDataStoreKeys.KEY_STATISTICS, StatisticsServiceClient.instance().getBuildInfoURL()));
            dispatch(MetaDataActionCreator.FetchBuildInfo(MetaDataStoreKeys.KEY_REPORT, ReportServiceClient.instance().getBuildInfoURL()));
            dispatch(MetaDataActionCreator.FetchClientBuildInfo());
        };
    }
}
