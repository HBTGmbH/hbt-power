import {ActionType} from '../../../ActionType';
import {BaseProfile} from '../model/BaseProfile';
import {ProfileEntryField} from '../model/ProfileEntryField';
import {AbstractAction} from '../../../BaseActions';
import {ProfileEntry} from '../model/ProfileEntry';
import {ProfileSkill} from '../model/ProfileSkill';

export interface BaseProfileLoadAction extends AbstractAction {
    baseProfile: BaseProfile;
}

export interface EntryLoadAction extends AbstractAction {
    entry: Array<ProfileEntry>,
    field: ProfileEntryField
}

export interface EntryDeleteAction extends AbstractAction {
    id: number;
    field: ProfileEntryField;
}

export interface EntryUpdateAction extends AbstractAction {
    entry: ProfileEntry;
    field: ProfileEntryField;
}

export interface SkillLoadAction extends AbstractAction {
    skills: Array<ProfileSkill>
}

export function skillLoadAction(skills: Array<ProfileSkill>): SkillLoadAction {
    return {
        type: ActionType.LoadSkillsAction,
        skills: skills
    };
}

export interface SkillUpdateAction extends AbstractAction {
    skill: ProfileSkill
}

export interface SetDescriptionAction extends AbstractAction {
    type: ActionType.SetDescription;
    description: string;
}

export function setDescription(description: string): SetDescriptionAction {
    return {
        description: description,
        type: ActionType.SetDescription
    }
}

export function skillUpdateAction(skill: ProfileSkill) {
    return {
        type:ActionType.UpdateProfileSkillSuccessful,
        skill:skill
    }
}

export interface SkillDeleteAction extends AbstractAction {
    id: number;
}

export function skillDeleteAction(id: number) {
    return {
        type: ActionType.DeleteProfileSkillSuccessful,
        id: id
    };
}

export function entryUpdateAction(entry: ProfileEntry, field: ProfileEntryField): EntryUpdateAction {
    return {
        type: ActionType.UpdateEntrySuccessful,
        entry: entry,
        field: field
    };
}

export function baseProfileLoadAction(baseProfile: BaseProfile): BaseProfileLoadAction {
    return {
        type: ActionType.LoadBaseProfileAction,
        baseProfile: baseProfile
    };
}

export function entryLoadAction(entry: Array<ProfileEntry>, field: ProfileEntryField): EntryLoadAction {
    return {
        type: ActionType.LoadEntriesAction,
        entry: entry,
        field: field
    };
}

export function entryDeleteAction(id: number, field: ProfileEntryField): EntryDeleteAction {
    return {
        type: ActionType.DeleteEntrySuccessful,
        id: id,
        field: field
    };
}

export function resetProfileStore(): AbstractAction {
    return {
        type: ActionType.ResetProfileStore
    };
}
