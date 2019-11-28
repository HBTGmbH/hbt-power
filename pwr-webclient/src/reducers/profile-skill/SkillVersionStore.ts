export interface SkillVersionStore {

    serviceSkillId: number;
    currentVersions: string[];
}

export const emptySkillVersionStore: SkillVersionStore = {
    serviceSkillId: -1,
    currentVersions: [],
};
