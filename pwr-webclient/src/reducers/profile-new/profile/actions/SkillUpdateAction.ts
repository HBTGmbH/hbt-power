import {ProfileSkill} from '../model/ProfileSkill';
import {AbstractAction} from '../../../profile/database-actions';
import {ActionType} from '../../../ActionType';

export interface SkillUpdateAction extends AbstractAction {
    skill: ProfileSkill
}


export function skillUpdateAction(skill: ProfileSkill) {
    return {
        type:ActionType.UpdateProfileSkillSuccessful,
        skill:skill
    }
}