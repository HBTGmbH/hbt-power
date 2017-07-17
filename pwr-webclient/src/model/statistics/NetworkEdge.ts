import {doop} from 'doop';
import {APIEdge} from './ApiMetrics';
@doop
export class NetworkEdge {
    @doop public get source() {return doop<number, this>()};
    @doop public get target() {return doop<number, this>()};
    @doop public get strength() {return doop<number, this>()};

    constructor(source: number, target: number, strength: number) {
        return this.source(source).target(target).strength(strength);
    }

    public static fromAPI(node: APIEdge) {
        return new NetworkEdge(node.node1, node.node2, node.strength);
    }
}