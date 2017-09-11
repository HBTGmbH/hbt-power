import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
import {NetworkNodeDetails} from './network-node-details_module.';
import {Network} from '../../../model/statistics/Network';
import * as vis from 'vis';
import {Edge, Node} from 'vis';
import {ApplicationState} from '../../../reducers/reducerIndex';

interface ProfileNetworkGraphProps {
    network: Network;
}

interface ProfileNetworkGraphLocalProps {

}

interface ProfileNetworkGraphLocalState {
    selectedNodeProperties: vis.Properties;
}

interface ProfileNetworkGraphDispatch {

}

interface ConnectedNode {
    nodeId: number;
    strength: number;
}


class ProfileNetworkGraphModule extends React.Component<
    ProfileNetworkGraphProps
    & ProfileNetworkGraphLocalProps
    & ProfileNetworkGraphDispatch, ProfileNetworkGraphLocalState> {

    private network: vis.Network = null;

    constructor(props: any) {
        super(props);
        this.state = {
            selectedNodeProperties: null,
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: ProfileNetworkGraphLocalProps): ProfileNetworkGraphProps {
        return {
            network: state.statisticsReducer.network()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileNetworkGraphDispatch {
        return {}
    }

    public shouldComponentUpdate(nextProps:
                                     ProfileNetworkGraphProps
                                     & ProfileNetworkGraphLocalProps
                                     & ProfileNetworkGraphDispatch, nextState: ProfileNetworkGraphLocalState) {
        if (nextProps.network !== this.props.network) {
            this.network = null;
            this.setState({
                selectedNodeProperties: null
            })
        }
        return nextProps.network !== this.props.network || this.state !== nextState;
    }

    public componentDidMount() {
        this.renderGraph();
    }

    public componentDidUpdate() {
        this.renderGraph();
    }

    private renderGraph = () => {
        if (!isNullOrUndefined(this.props.network) && isNullOrUndefined(this.network)) {
            let container = document.getElementById('vis-profile-network');
            let nodes: Array<Node> = this.props.network.nodes().map(node => {
                return {
                    id: node.id(),
                    label: node.initials(),
                    value: node.matchFactor(),
                    title: (node.matchFactor() * 100).toFixed(2) + ' % Übereinstimmung mit Cluster',
                    group: node.cluster().toString()
                };
            }).toArray();

            let edges: Array<Edge> = this.props.network.edges().map(edge => {
                return {
                    from: edge.source(),
                    to: edge.target(),
                    title: edge.strength().toString() + ' gemeinsame Skills'
                };
            }).toArray();

            let options: vis.Options = {
                height: '600px',
                nodes: {
                    scaling: {
                        min: 0.0,
                        max: 1.0
                    }
                },
                edges: {
                    color: {inherit: true},
                    width: 0.15,
                    smooth: {
                        type: 'continuous',
                        enabled: true,
                        roundness: 0.5
                    }
                },
            };
            let data: vis.Data = {
                nodes: nodes,
                edges: edges
            };
            this.network = new vis.Network(container, data, options);

            this.network.on('click', params => {
                console.log(params);
                this.setState({
                    selectedNodeProperties: params.nodes.length > 0 ? params : null
                })
            });
        }
    };

    /**
     * Gets a list of connected nodes and their respective edge values
     * @param node
     * @returns {IdType[]}
     */
    private getConnectedNodes = (node: vis.IdType) => {
        return this.props.network.edges().filter(edge => edge.target() == node || edge.source() == node).map(edge => {
            let targetNode = edge.source();
            if (targetNode == node) targetNode = edge.target();
            return {nodeId: targetNode, strength: edge.strength()}
        }).toArray().sort((a, b) => a.strength > b.strength ? -1 : a.strength == b.strength ? 0 : 1);
    };

    private getInitialsByNodeId = (nodeId: vis.IdType) => {
        return this.props.network.nodes().find(node => node.id() == nodeId).initials();
    };

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-9"
                         style={{color: "white"}}>{PowerLocalize.get("ProfileNetwork.Description")}</div>
                </div>
                <div className="row">
                    <div className="vis-profile-network col-md-9"
                         id="vis-profile-network"
                         style={{border: '2px solid lightgray', backgroundColor: 'white'}}
                    />
                    <div className="col-md-3">
                        { !isNullOrUndefined(this.state.selectedNodeProperties) ?
                            <NetworkNodeDetails
                                network={this.props.network}
                                selectedNodeProperties={this.state.selectedNodeProperties}
                            />
                            : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * @see ProfileNetworkGraphModule
 * @author nt
 * @since 22.06.2017
 */
export const ProfileNetworkGraph: React.ComponentClass<ProfileNetworkGraphLocalProps> = connect(ProfileNetworkGraphModule.mapStateToProps, ProfileNetworkGraphModule.mapDispatchToProps)(ProfileNetworkGraphModule);