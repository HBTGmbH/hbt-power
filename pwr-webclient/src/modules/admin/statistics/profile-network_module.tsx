import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Network} from '../../../model/statistics/Network';
import {ProfileNetworkGraph} from '../../general/statistics/profile-network_module';
import {ApplicationState} from '../../../reducers/reducerIndex';


interface ProfileNetworkProps {
    network: Network;
}

interface ProfileNetworkLocalProps {

}

interface ProfileNetworkLocalState {
    clusters: number;
    iterations: number;
    method: string;
}

interface ProfileNetworkDispatch {
}

interface ConnectedNode {
    nodeId: number;
    strength: number;
}

class ProfileNetworkModule extends React.Component<
    ProfileNetworkProps
    & ProfileNetworkLocalProps
    & ProfileNetworkDispatch, ProfileNetworkLocalState> {



    constructor(props: ProfileNetworkProps & ProfileNetworkLocalProps & ProfileNetworkDispatch) {
        super(props);
        this.state = {
            clusters: 2,
            iterations: 10,
            method: 'SIM_RANK'
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ProfileNetworkLocalProps): ProfileNetworkProps {
        return {
            network: state.statisticsReducer.network()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileNetworkDispatch {
        return {};
    }


    render() {
        return (
            <div>
                <ProfileNetworkGraph/>
            </div>);
    }
}

/**
 * @see ProfileNetworkModule
 * @author nt
 * @since 19.06.2017
 */
export const ProfileNetwork: React.ComponentClass<ProfileNetworkLocalProps> = connect(ProfileNetworkModule.mapStateToProps, ProfileNetworkModule.mapDispatchToProps)(ProfileNetworkModule);