import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {Network} from '../../../model/statistics/Network';
import {ProfileNetworkGraph} from '../../general/statistics/profile-network_module';


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
                {/*<Paper style={{paddingLeft: '10px', paddingRight: '10px'}}>
                    <Subheader>{PowerLocalize.get('ProfileNetwork.Method')}</Subheader>
                    <RadioButtonGroup
                        name="method"
                        valueSelected={this.state.method}
                        onChange={(evt, val) => this.setState({method: val})}>
                        <RadioButton
                            value="COMMON_SKILLS"
                            label="Skill-Gemeinsamkeit"
                        />
                        <RadioButton
                            value="SIM_RANK"
                            label="SimRank"
                        />
                    </RadioButtonGroup>
                    <Slider
                        value={this.state.iterations}
                        min={2}
                        max={500}
                        step={1}
                        onChange={(evt, val) => this.setState({iterations: val})}
                    />
                    <Subheader>{PowerLocalize.get('ProfileNetwork.IterationCount') + this.state.iterations}</Subheader>
                    <Slider
                        value={this.state.clusters}
                        min={2}
                        max={40}
                        step={1}
                        onChange={(evt, val) => this.setState({clusters: val})}
                    />
                    <Subheader>{PowerLocalize.get('ProfileNetwork.ClusterAmount') + this.state.clusters}</Subheader>
                    <RaisedButton label={PowerLocalize.get('ProfileNetwork.Recalc')}/>
                </Paper>*/}
            </div>);
    }
}

/**
 * @see ProfileNetworkModule
 * @author nt
 * @since 19.06.2017
 */
export const ProfileNetwork: React.ComponentClass<ProfileNetworkLocalProps> = connect(ProfileNetworkModule.mapStateToProps, ProfileNetworkModule.mapDispatchToProps)(ProfileNetworkModule);