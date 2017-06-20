import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {Network} from '../../../model/statistics/Network';
import {isNullOrUndefined} from 'util';
import * as vis from 'vis';
import {DataSet, Edge, Node} from 'vis';
import {NetworkNode} from '../../../model/statistics/NetworkNode';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {RaisedButton, FontIcon, Paper, Card, CardHeader, CardText, Subheader} from 'material-ui';
import {NetworkNodeDetails} from './network-node-details_module.';


interface ProfileNetworkProps {
    network: Network;
}

interface ProfileNetworkLocalProps {

}

interface ProfileNetworkLocalState {
    selectedNodeProperties: vis.Properties;
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

    private availableColors = ['orange', 'green', 'red', 'violet', 'brown'];
    private takenColors: Map<number, string> = new Map<number, string>();
    private network: vis.Network = null;

    constructor(props: ProfileNetworkProps & ProfileNetworkLocalProps & ProfileNetworkDispatch) {
        super(props);
        this.state = {
            selectedNodeProperties: null
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

    public shouldComponentUpdate(nextProps: ProfileNetworkProps & ProfileNetworkLocalProps & ProfileNetworkDispatch, nextState: ProfileNetworkLocalState) {
        if(nextProps.network !== this.props.network) this.network = null;
        return nextProps.network !== this.props.network || this.state.selectedNodeProperties !== nextState.selectedNodeProperties;
    }

    public componentDidMount() {
        this.renderGraph();
    }

    public componentDidUpdate() {
        this.renderGraph();
    }

    private getColorByCluster(clusterId: number): string {
        if(this.takenColors.has(clusterId)) {
            return this.takenColors.get(clusterId);
        } else {
            let color = this.availableColors[this.availableColors.length - 1];
            this.availableColors.pop();
            this.takenColors.set(clusterId, color);
            return color;
        }
    }

    private renderGraph = () => {
        if(!isNullOrUndefined(this.props.network) && isNullOrUndefined(this.network)) {
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
                    color:{inherit:true},
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
    private getConnectedNodes = (node: vis.IdType) =>  {
        return this.props.network.edges().filter(edge => edge.target() == node || edge.source() == node).map(edge => {
            let targetNode = edge.source();
            if(targetNode == node) targetNode = edge.target();
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
                    <div className="col-md-9" style={{color: "white"}}>{PowerLocalize.get("ProfileNetwork.Description")}</div>
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
            </div>);
    }
}

/**
 * @see ProfileNetworkModule
 * @author nt
 * @since 19.06.2017
 */
export const ProfileNetwork: React.ComponentClass<ProfileNetworkLocalProps> = connect(ProfileNetworkModule.mapStateToProps, ProfileNetworkModule.mapDispatchToProps)(ProfileNetworkModule);