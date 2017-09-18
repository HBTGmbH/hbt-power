import {APIBuildInfo, BuildInfo} from '../../model/metadata/BuildInfo';
import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {ApplicationState} from '../reducerIndex';
import * as redux from 'redux';
import axios from 'axios';
import {MetaDataStore} from '../../model/metadata/MetaDataStore';
import {
    getProfileBuildInfo,
    getReportBuildInfo,
    getSkillBuildInfo,
    getStatisticsBuildsInfo,
    ViewProfileService
} from '../../API_CONFIG';

export interface AddOrReplaceBuildInfoAction extends AbstractAction {
    service: string;
    buildInfo: BuildInfo;
}

export namespace MetaDataActionCreator {

    export function AddOrReplaceBuildInfo(service: string, buildInfo: BuildInfo): AddOrReplaceBuildInfoAction {
        return {
            type: ActionType.AddOrReplaceBuildInfo,
            service: service,
            buildInfo: buildInfo
        }
    }


    export function FetchBuildInfo(service:string, serviceUrl: string) {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(serviceUrl).then(response => {
                let apiBuildInfo = response.data as APIBuildInfo;
                dispatch(AddOrReplaceBuildInfo(service, BuildInfo.of(apiBuildInfo)));
            }).catch(error => {
                console.error(error);
                dispatch(AddOrReplaceBuildInfo(service, BuildInfo.offline(service)));
            })
        }
    }

    export function FetchAllBuildInfo() {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            dispatch(FetchBuildInfo(MetaDataStore.KEY_PROFILE, getProfileBuildInfo()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_STATISTICS, getStatisticsBuildsInfo()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_SKILL, getSkillBuildInfo()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_REPORT, getReportBuildInfo()));
            dispatch(FetchBuildInfo(MetaDataStore.KEY_VIEW_PROFIE, ViewProfileService.getBuildInfo()));
        }
    }
}