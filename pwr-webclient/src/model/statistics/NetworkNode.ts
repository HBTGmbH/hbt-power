import {doop} from 'doop';
import {APINode} from './ApiMetrics';

@doop
export class NetworkNode {
    @doop
    public get id() {
        return doop<number, this>();
    };

    @doop
    public get initials() {
        return doop<string, this>();
    };

    @doop
    public get cluster() {
        return doop<number, this>();
    };

    @doop
    public get matchFactor() {
        return doop<number, this>();
    };

    public constructor(id: number, initials: string, cluster: number, matchFactor: number) {
        return this.id(id).initials(initials).cluster(cluster).matchFactor(matchFactor);
    }

    public static fromAPI(apiNetworkNode: APINode) {
        return new NetworkNode(Number(apiNetworkNode.id), apiNetworkNode.initials, Number(apiNetworkNode.cluster), Number(apiNetworkNode.matchFactor));
    }
}