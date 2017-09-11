import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ConsultantClusterInfo} from '../../../model/statistics/ConsultantClusterInfo';
import {ConsultantClusterOverview} from '../../general/statistics/consultant-cluster-info_module';
import {isNullOrUndefined} from 'util';
import {ApplicationState} from '../../../reducers/reducerIndex';

interface ClusterResultProps {
    consultantClusterInfo: ConsultantClusterInfo;
}

interface ClusterResultLocalProps {

}

interface ClusterResultLocalState {

}

interface ClusterResultDispatch {

}

class ClusterResultModule extends React.Component<
    ClusterResultProps
    & ClusterResultLocalProps
    & ClusterResultDispatch, ClusterResultLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ClusterResultLocalProps): ClusterResultProps {
        return {
            consultantClusterInfo: state.statisticsReducer.consultantClusterInfo()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ClusterResultDispatch {
        return {}
    }

    render() {
        if(isNullOrUndefined(this.props.consultantClusterInfo)) return null;
        return (<div>
            <ConsultantClusterOverview info={this.props.consultantClusterInfo}/>
        </div>);
    }
}

/**
 * @see ClusterResultModule
 * @author nt
 * @since 23.06.2017
 */
export const ClusterResult: React.ComponentClass<ClusterResultLocalProps> = connect(ClusterResultModule.mapStateToProps, ClusterResultModule.mapDispatchToProps)(ClusterResultModule);