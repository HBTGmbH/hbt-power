import * as React from 'react';
import {Card, CardContent, CardHeader, ListSubheader} from '@material-ui/core';
import {Network} from '../../../model/statistics/Network';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {Properties} from 'vis';

interface NetworkNodeDetailsProps {
    network: Network;
    selectedNodeProperties: Properties;
}

interface NetworkNodeDetailsState {

}

export class NetworkNodeDetails extends React.Component<NetworkNodeDetailsProps, NetworkNodeDetailsState> {

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
        <Card>
            <CardHeader
                title={PowerLocalize.get('ProfileNetwork.NodeDetails.Title') + ' ' + this.getInitialsByNodeId(this.props.selectedNodeProperties.nodes[0])}
            />
            <CardContent>
                <ListSubheader>{PowerLocalize.get('ProfileNetwork.Details.Connections')}</ListSubheader>
                <table className="table">
                    <thead>
                    <tr>
                        <th>{PowerLocalize.get('Initials.Singular')}</th>
                        <th>{PowerLocalize.get('ProfileNetwork.CommonSkillsCount')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.getConnectedNodes(this.props.selectedNodeProperties.nodes[0]).map(nd => {
                            return (<tr key={'Network.Detail.TableRow.' + nd.nodeId}>
                                <td>{this.getInitialsByNodeId(nd.nodeId)}</td>
                                <td>{nd.strength}</td>
                            </tr>);
                        })
                    }
                    </tbody>
                </table>
            </CardContent>
        </Card>);
    }
}
