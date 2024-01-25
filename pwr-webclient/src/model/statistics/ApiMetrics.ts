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
