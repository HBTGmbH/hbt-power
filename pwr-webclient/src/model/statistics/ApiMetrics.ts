export interface APISkillUsageMetric {
    name: string;
    value: number;
}

export interface APIProfileSkillMetric {
    /**
     * Common skills found in the profile
     */
    common: Array<string>;
    /**
     * Common skills missing.
     */
    missing: Array<string>;
}

// == API Network == //

export interface APINode {
    id: number;
    initials: string;
    cluster: number;
    matchFactor: number;
}

export interface APIEdge {
    node1: number;
    node2: number;
    strength: number;
}

export interface APINetwork {
    nodes: Array<APINode>;
    edges: Array<APIEdge>;
}

// == API consultant Info == //

export interface APIAveragedSkill {
    name: string;
    numOccurances: number;
    average: number;
    relativeOccurance: number;

}

export interface APIConsultantClusterInfo {
    clusterId: number;
    clusterInitials: Array<string>;
    clusterSkills: Array<APIAveragedSkill>;
    commonSkills: Array<string>;
    recommendations: Array<string>;
}