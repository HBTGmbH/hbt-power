import {doop} from 'doop';
import {AdminNotification, APIAdminNotification} from './AdminNotification';
import {Skill} from '../Skill';
import {APISkill} from '../APIProfile';

export interface APISkillNotification extends APIAdminNotification {
    skill: APISkill;
    newName: string;
}


@doop
export class SkillNotification {
    @doop public get adminNotification() {return doop<AdminNotification, this>()};
    @doop public get skill() {return doop<Skill, this>()};
    @doop public get newName() {return doop<string, this>()};

    constructor(adminNotification: AdminNotification, skill: Skill, newName: string) {
        return this.adminNotification(adminNotification).skill(skill).newName(newName);
    }

    public static of(adminNotification: AdminNotification, skill: Skill, newName: string) {
        return new SkillNotification(adminNotification, skill, newName);
    }

    public static fromAPI(apiSkillNotification: APISkillNotification) {
        return new SkillNotification(
            AdminNotification.fromAPI(apiSkillNotification),
            Skill.fromAPI(apiSkillNotification.skill),
            apiSkillNotification.newName
        )
    }
}