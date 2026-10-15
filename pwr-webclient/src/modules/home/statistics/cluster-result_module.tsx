import {connect} from 'react-redux';
import * as React from 'react';
import {ConsultantClusterOverview} from '../../general/statistics/consultant-cluster-info_module';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {APIConsultantClusterInfo} from '../../../model/statistics/ApiMetrics';

interface ClusterResultProps {
    consultantClusterInfo: APIConsultantClusterInfo;
}

interface ClusterResultLocalProps {

}

interface ClusterResultLocalState {

}

interface ClusterResultDispatch {

}

class ClusterResultModule extends React.Component<ClusterResultProps
    & ClusterResultLocalProps
    & ClusterResultDispatch, ClusterResultLocalState> {

    static mapStateToProps(state: ApplicationState): ClusterResultProps {
        return {
            consultantClusterInfo: state.statisticsReducer.consultantClusterInfo
        };
    }

    static mapDispatchToProps(): ClusterResultDispatch {
        return {};
    }

    render() {
        if (!this.props.consultantClusterInfo){
            return null;
        }
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
export const ClusterResult: React.ComponentClass<ClusterResultLocalProps> = connect(ClusterResultModule.mapStateToProps, ClusterResultModule.mapDispatchToProps)(ClusterResultModule) as any;
