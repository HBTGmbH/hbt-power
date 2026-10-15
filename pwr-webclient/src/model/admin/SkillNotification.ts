import {AdminNotification, APIAdminNotification} from './AdminNotification';
import {Skill} from '../Skill';
import {APISkill} from '../APIProfile';

export interface APISkillNotification extends APIAdminNotification {
    skill: APISkill;
    newName: string;
}


export class SkillNotification {

    private readonly _adminNotification: AdminNotification;
    private readonly _skill: Skill;
    private readonly _newName: string;

    public adminNotification() {
        return this._adminNotification;
    };

    public skill() {
        return this._skill;
    };

    public newName() {
        return this._newName;
    };

    public setNewName(newName: string): SkillNotification {
        return new SkillNotification(this._adminNotification, this._skill, newName)
    }

    private constructor(adminNotification: AdminNotification, skill: Skill, newName: string) {
        this._adminNotification = adminNotification;
        this._skill = skill;
        this._newName = newName;
    }

    public static of(adminNotification: AdminNotification, skill: Skill, newName: string) {
        return new SkillNotification(adminNotification, skill, newName);
    }

    public static fromAPI(apiSkillNotification: APISkillNotification) {
        return new SkillNotification(
            AdminNotification.fromAPI(apiSkillNotification),
            Skill.fromAPI(apiSkillNotification.skill),
            apiSkillNotification.newName
        );
    }

    public toAPI(): APISkillNotification {
        let thisToApi = {
            skill: this.skill().toAPI(),
            newName: this.newName(),
        };
        return Object.assign(thisToApi, this.adminNotification().toApi());
    }
}
