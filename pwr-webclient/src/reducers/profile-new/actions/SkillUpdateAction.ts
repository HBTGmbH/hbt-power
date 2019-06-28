import {ProfileSkill} from '../model/ProfileSkill';
import {AbstractAction} from '../../profile/database-actions';

export interface SkillUpdateAction extends AbstractAction {
    skill: ProfileSkill
}