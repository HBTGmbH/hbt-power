import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ApplicationState} from '../../Store';
import {BuildInfo} from '../../model/metadata/BuildInfo';
import {Subheader} from 'material-ui';
import {SingleBuildInfo} from './single-build-info_module';
import {MetaDataActionCreator} from '../../reducers/metadata/MetaDataActions';
import {Comparators} from '../../utils/Comparators';


interface BuildInfoProps {
    buildInfo: Immutable.Map<string, BuildInfo>;
}

interface BuildInfoLocalProps {

}

interface BuildInfoLocalState {

}

interface BuildInfoDispatch {
    fetchBuildInfo(): void;
}

class BuildInfoModule extends React.Component<
    BuildInfoProps
    & BuildInfoLocalProps
    & BuildInfoDispatch, BuildInfoLocalState> {

    public componentDidMount() {
        this.props.fetchBuildInfo();
    }

    static mapStateToProps(state: ApplicationState, localProps: BuildInfoLocalProps): BuildInfoProps {
        return {
            buildInfo: state.metaDataReducer.buildInfoByService()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): BuildInfoDispatch {
        return {
            fetchBuildInfo: () => dispatch(MetaDataActionCreator.FetchAllBuildInfo())
        }
    }

    render() {
        return (<div>
            <Subheader>Service-Summary</Subheader>
            <div style={{paddingLeft: "16px"}}>
            {this.props.buildInfo
                .sort(Comparators.getBuildInfoComparator(true))
                .map(buildInfo => <div key={buildInfo.name()}><SingleBuildInfo buildInfo={buildInfo}/><br/></div>)
                .toArray()}
            </div>
        </div>);
    }
}

/**
 * @see BuildInfoModule
 * @author nt
 * @since 21.08.2017
 */
export const BottomBuildInfo: React.ComponentClass<BuildInfoLocalProps> = connect(BuildInfoModule.mapStateToProps, BuildInfoModule.mapDispatchToProps)(BuildInfoModule);