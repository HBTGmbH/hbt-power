import {ProfileSkill} from '../profile-new/profile/model/ProfileSkill';

export interface SkillInfoStore {

    serviceSkillId: number;
    currentVersions: string[];
    currentSkill: ProfileSkill;
}

export const emptySkillInfoStore: SkillInfoStore = {
    serviceSkillId: -1,
    currentVersions: [],
    currentSkill: {id: -1, name: '', rating: 0, versions: []}
};
