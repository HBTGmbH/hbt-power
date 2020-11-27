import {connect} from 'react-redux';
import * as React from 'react';
import * as Immutable from 'immutable';
import {BuildInfo} from '../../model/metadata/BuildInfo';
import {ListSubheader} from '@material-ui/core';
import {SingleBuildInfo} from './single-build-info_module';
import {MetaDataActionCreator} from '../../reducers/metadata/MetaDataActions';
import {Comparators} from '../../utils/Comparators';
import {ApplicationState} from '../../reducers/reducerIndex';
import {ClientBuildInfo} from '../../model/metadata/ClientBuildInfo';
import {ThunkDispatch} from 'redux-thunk';


interface BuildInfoProps {
    buildInfo: Immutable.Map<string, BuildInfo>;
    clientInfo: ClientBuildInfo;
}

interface BuildInfoLocalProps {

}

interface BuildInfoLocalState {

}

interface BuildInfoDispatch {
    fetchBuildInfo(): void;
}

class BuildInfoModule extends React.Component<BuildInfoProps
    & BuildInfoLocalProps
    & BuildInfoDispatch, BuildInfoLocalState> {

    public componentDidMount() {
        this.props.fetchBuildInfo();
    }

    static mapStateToProps(state: ApplicationState, localProps: BuildInfoLocalProps): BuildInfoProps {
        return {
            buildInfo: state.metaDataReducer.buildInfoByService(),
            clientInfo: state.metaDataReducer.clientBuildInfo(),
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): BuildInfoDispatch {
        return {
            fetchBuildInfo: () => dispatch(MetaDataActionCreator.FetchAllBuildInfo())
        };
    }

    private renderClientInfo = (info: ClientBuildInfo) => (info != null ?
            <span>
        <span className="build-info-highlight">Webclient</span>
        <span className="build-info-normal"> version </span>
        <span className="build-info-highlight">{info.version}</span>
        <span className="build-info-normal"> built on </span>
        <span className="build-info-highlight">{info.date.toUTCString()}</span>
        <span className="build-info-normal"> built by </span>
        <span className="build-info-highlight">{info.builder}</span>
    </span> :
            <span>
        <span className="build-info-highlight">Webclient Build Info </span>
        <span className="build-info-normal"> is </span>
        <span className="build-info-offline">unavailable </span>
    </span>
    );

    render() {
        return (<div>
            <ListSubheader>Service-Summary</ListSubheader>
            <div style={{paddingLeft: '16px'}}>
                {this.props.buildInfo
                    .sort(Comparators.getBuildInfoComparator(true))
                    .map(buildInfo => <div key={buildInfo.name()}><SingleBuildInfo buildInfo={buildInfo}/><br/></div>)
                    .toArray()}
            </div>
            <ListSubheader>Client-Info</ListSubheader>
            <div style={{paddingLeft: '16px'}}>
                {this.renderClientInfo(this.props.clientInfo)}
            </div>
        </div>);
    }
}

/**
 * @see BuildInfoModule
 * @author nt
 * @since 21.08.2017
 */
export const BottomBuildInfo: React.ComponentClass<BuildInfoLocalProps> = connect(BuildInfoModule.mapStateToProps, BuildInfoModule.mapDispatchToProps)(BuildInfoModule) as any;
