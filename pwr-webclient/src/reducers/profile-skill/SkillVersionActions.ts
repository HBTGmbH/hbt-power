import {AbstractAction} from '../BaseActions';
import {ActionType} from '../ActionType';

export interface SkillVersionsLoadAction extends AbstractAction {
    versions: string[];
    serviceSkillId: number;
}

export function newSkillVersionsLoadAction(versions: string[], skillId: number): SkillVersionsLoadAction {
    return {
        type: ActionType.LoadVersionsForSkill,
        versions: versions,
        serviceSkillId: skillId,
    };
}


export interface SkillVersionDeleteAction extends AbstractAction {
    versionToDelete: string;
}

export function newSkillVersionDeleteAction(versionToDelete: string): SkillVersionDeleteAction {
    return {
        type: ActionType.DeleteVersionFromSkill,
        versionToDelete: versionToDelete
    };
}
