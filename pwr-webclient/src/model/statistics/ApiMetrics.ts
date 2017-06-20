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
    nodes:Array<APINode>;
    edges: Array<APIEdge>;
}