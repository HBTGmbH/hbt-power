import {emptyStore, ProfileStore} from './ProfileStore';
import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {EntryUpdateAction} from './actions/EntryUpdateAction';
import {Profile} from './model/Profile';
import {EntryDeleteAction} from './actions/EntryDeleteAction';
import {ProfileEntry} from './model/ProfileEntry';
import {ComparatorBuilder} from 'ts-comparator';
import {ProfileEntryField} from './model/ProfileEntryField';
import {SkillUpdateAction} from './actions/SkillUpdateAction';
import {ProfileSkill} from './model/ProfileSkill';
import {SkillDeleteAction} from './actions/SkillDeleteAction';
import {ProjectDeleteAction} from './actions/ProjectDeleteAction';
import {ProjectUpdateAction} from './actions/ProjectUpdateAction';
import {Project} from './model/Project';

export function reduce(store: ProfileStore = emptyStore, action: AbstractAction): ProfileStore {

    switch (action.type) {
        case ActionType.UpdateEntrySuccessful: {
            let profile = handleUpdateEntry(action as EntryUpdateAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.DeleteEntrySuccessful: {
            let profile = handleDeleteEntry(action as EntryDeleteAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.UpdateProfileSkillSuccessful: {
            let profile = handleUpdateSkill(action as SkillUpdateAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.DeleteProfileSkillSuccessful: {
            let profile = handleDeleteSkill(action as SkillDeleteAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.UpdateProjectSuccessful: {
            let profile = handleUpdateProject(action as ProjectUpdateAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.DeleteProjectSuccessful: {
            let profile = handleDeleteProject(action as ProjectDeleteAction, store.profile);
            return replaceProfile(store, profile);
        }
        default:
            return store;
    }
    return store;
}

const projectsByStartDate = ComparatorBuilder.comparing<Project>(t => t.startDate.getFullYear()).build();
const skillByName = ComparatorBuilder.comparing<ProfileSkill>(t => t.name).build();
const byName = ComparatorBuilder.comparing<ProfileEntry>(t => t.nameEntity.name).build();
const byId = (id: number) => (other: ProfileEntry) => other.id === id;

function replaceProfile(store: ProfileStore, profile: Profile): ProfileStore {
    return {...store, ...{profile: profile}};
}

function sortAndReplace(profile: Profile, field: ProfileEntryField, collection: Array<ProfileEntry>) {
    collection.sort(byName);
    return {...profile, ...{[field]: collection}};
}

function handleUpdateEntry(action: EntryUpdateAction, profile: Profile): Profile {
    let field: Array<ProfileEntry> = profile[action.field];
    let newField = field.filter(byId(action.entry.id));
    newField.push(action.entry);
    return sortAndReplace(profile, action.field, newField);
}

function handleDeleteEntry(action: EntryDeleteAction, profile: Profile): Profile {
    let field: Array<ProfileEntry> = profile[action.field];
    let newField = field.filter(byId(action.id));
    return sortAndReplace(profile, action.field, newField);
}

function handleUpdateSkill(action: SkillUpdateAction, profile: Profile): Profile {
    let skills = profile.skills;
    let newSkills = skills.filter(s => s.id == action.skill.id);
    newSkills.push(action.skill);
    newSkills.sort(skillByName);
    return {...profile, ...{skills: newSkills}};

}

function handleDeleteSkill(action: SkillDeleteAction, profile: Profile): Profile {
    let skills = profile.skills;
    let newSkills = skills.filter(s => s.id === action.id);
    newSkills.sort(skillByName);
    return {...profile, ...{skills: newSkills}};
}


function handleUpdateProject(action: ProjectUpdateAction, profile: Profile): Profile {
    let projects = profile.projects;
    let newProjects = projects.filter(s => s.id == action.project.id);
    newProjects.push(action.project);
    newProjects.sort(projectsByStartDate);
    return {...profile, ...{projects: newProjects}};

}

function handleDeleteProject(action: ProjectDeleteAction, profile: Profile): Profile {
    let project = profile.projects;
    let newProjects = project.filter(s => s.id === action.id);
    newProjects.sort(projectsByStartDate);
    return {...profile, ...{projects: newProjects}};
}



