import {doop} from 'doop';
import * as Immutable from 'immutable';
import {AveragedSkill} from './AveragedSkill';
import {APIConsultantClusterInfo} from './ApiMetrics';

@doop
export class ConsultantClusterInfo {
    @doop
    public get clusterId() {
        return doop<number, this>();
    };

    @doop
    public get clusterInitials() {
        return doop<Immutable.OrderedSet<string>, this>();
    };

    @doop
    public get commonSkills() {
        return doop<Immutable.OrderedSet<string>, this>();
    };

    @doop
    public get recommendations() {
        return doop<Immutable.OrderedSet<string>, this>();
    };

    @doop
    public get clusterSkills() {
        return doop<Immutable.OrderedSet<AveragedSkill>, this>();
    };

    constructor(clusterId: number,
                clusterInitials: Immutable.OrderedSet<string>,
                commonSkills: Immutable.OrderedSet<string>,
                recommendations: Immutable.OrderedSet<string>,
                clusterSkills: Immutable.OrderedSet<AveragedSkill>) {
        this.clusterId(clusterId).clusterInitials(clusterInitials).commonSkills(commonSkills)
            .recommendations(recommendations).clusterSkills(clusterSkills);
    }

    public static fromAPI(api: APIConsultantClusterInfo): ConsultantClusterInfo {
        return new ConsultantClusterInfo(
            api.clusterId,
            Immutable.OrderedSet<string>(api.clusterInitials),
            Immutable.OrderedSet<string>(api.commonSkills),
            Immutable.OrderedSet<string>(api.recommendations),
            Immutable.OrderedSet<AveragedSkill>(api.clusterSkills.map(val => AveragedSkill.fromAPI(val)))
        );
    }
}