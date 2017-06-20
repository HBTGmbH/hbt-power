import {doop} from 'doop';
import {NetworkNode} from './NetworkNode';
import {NetworkEdge} from './NetworkEdge';
import * as Immutable from 'immutable';
import {APINetwork} from './ApiMetrics';

@doop
export class Network {
    @doop public get nodes() {return doop<Immutable.List<NetworkNode>, this>()}
    @doop public get edges() {return doop<Immutable.List<NetworkEdge>, this>()};

    constructor(nodes: Immutable.List<NetworkNode>, edges: Immutable.List<NetworkEdge>) {
        return this.nodes(nodes).edges(edges);
    }

    public static fromAPI(apiNetwork: APINetwork) {
        return new Network(
            Immutable.List<NetworkNode>(apiNetwork.nodes.map(val => NetworkNode.fromAPI(val))),
            Immutable.List<NetworkEdge>(apiNetwork.edges.map(val => NetworkEdge.fromAPI(val)))
        )
    }
}