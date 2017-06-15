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