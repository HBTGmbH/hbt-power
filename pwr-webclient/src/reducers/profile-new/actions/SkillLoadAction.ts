import {ProfileSkill} from '../model/ProfileSkill';
import {AbstractAction} from '../../profile/database-actions';
import {ActionType} from '../../ActionType';

export interface SkillLoadAction extends AbstractAction {
    skills: Array<ProfileSkill>
}

export function skillLoadAction(skills: Array<ProfileSkill>): SkillLoadAction {
    return {
        type: ActionType.LoadSkillsAction,
        skills: skills
    };
}