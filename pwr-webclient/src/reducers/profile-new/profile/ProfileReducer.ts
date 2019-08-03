import {emptyStore, ProfileStore} from '../ProfileStore';
import {ActionType} from '../../ActionType';
import {EntryUpdateAction} from './actions/EntryUpdateAction';
import {Profile} from './model/Profile';
import {EntryDeleteAction} from './actions/EntryDeleteAction';
import {ProfileEntry} from './model/ProfileEntry';
import {ComparatorBuilder} from 'ts-comparator';
import {ProfileEntryField} from './model/ProfileEntryField';
import {SkillUpdateAction} from './actions/SkillUpdateAction';
import {ProfileSkill} from './model/ProfileSkill';
import {SkillDeleteAction} from './actions/SkillDeleteAction';
import {Project} from './model/Project';
import {EntryLoadAction} from './actions/EntryLoadAction';
import {SkillLoadAction} from './actions/SkillLoadAction';
import {BaseProfileLoadAction} from './actions/BaseProfileLoadAction';
import {ConsultantUpdateAction} from '../consultant/actions/ConsultantUpdateAction';
import {isNullOrUndefined} from 'util';
import {
    ProjectDeleteAction,
    ProjectLoadAction,
    ProjectUpdateAction,
    SelectProjectAction,
    SetEditingProjectAction
} from './actions/ProjectActions';
import {AbstractAction} from '../../profile/database-actions';
import {replaceAtIndex} from '../../../utils/ImmutableUtils';
import {newNameEntity} from './model/NameEntity';
import {NameEntityType} from './model/NameEntityType';


export function reduceProfile(store: ProfileStore = emptyStore, action: AbstractAction): ProfileStore {
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
            // We successfully saved something
            // 1. Replace the project collection with the saved project
            // 2. Reset the editing project
            // 3. Release edit mode
            const profile = handleUpdateProject(action as ProjectUpdateAction, store.profile, store.selectedProjectIndex);
            const updatedStore = replaceProfile(store, profile);
            return {
                ...updatedStore,
                ...{
                    isProjectEditing: false,
                    editedProject: getProject(updatedStore.selectedProjectIndex, updatedStore)
                }
            };
        }
        case ActionType.DeleteProjectSuccessful: {
            let profile = handleDeleteProject(action as ProjectDeleteAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.LoadEntriesAction: {
            let profile = replaceField(action as EntryLoadAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.LoadSkillsAction: {
            let profile = replaceSkills(action as SkillLoadAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.LoadProjectsAction: {
            let profile = replaceProjects(action as ProjectLoadAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.LoadBaseProfileAction: {
            let profile = handleBaseProfile(action as BaseProfileLoadAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.UpdateConsultantAction: {
            return handleConsultantUpdate(action as ConsultantUpdateAction, store);
        }
        case ActionType.SelectProject: {
            return handleSelectProject((action as SelectProjectAction).value, cancelEditMode(store));
        }
        case ActionType.SetEditingProject: {
            const editedProject = (action as SetEditingProjectAction).project;
            return {...store, editedProject};
        }
        case ActionType.EditSelectedProject: {
            return {...store, ...{isProjectEditing: true}};
        }
        case ActionType.CancelEditSelectedProject: {
            return cancelEditMode(store);
        }
    }
    return store;
}

const projectsByStartDate = ComparatorBuilder.comparing<Project>(t => t.startDate.getDate()).build();
const skillByName = ComparatorBuilder.comparing<ProfileSkill>(t => t.name).build();
const byName = ComparatorBuilder.comparing<ProfileEntry>(t => t.nameEntity.name).build();
const byId = (id: number) => (other: ProfileEntry) => other.id !== id;

function handleConsultantUpdate(action: ConsultantUpdateAction, store: ProfileStore): ProfileStore {
    return {...store, consultant: action.consultant};
}

function replaceProfile(store: ProfileStore, profile: Profile): ProfileStore {
    return {...store, ...{profile: profile}};
}

function sortAndReplace(profile: Profile, field: ProfileEntryField, collection: Array<ProfileEntry>) {
    collection.filter(e => !isNullOrUndefined(e));
    collection.sort(byName);
    return {...profile, [field]: collection};
}

function replaceField(action: EntryLoadAction, profile: Profile): Profile {
    let newField: Array<ProfileEntry> = [];
    newField.push(...action.entry);
    return sortAndReplace(profile, action.field, newField);
}

function replaceSkills(action: SkillLoadAction, profile: Profile): Profile {
    let newSkills: Array<ProfileSkill> = [];
    newSkills.push(...action.skills);
    newSkills.sort(skillByName);
    return {...profile, ...{skills: newSkills}};
}

function replaceProjects(action: ProjectLoadAction, profile: Profile): Profile {
    let newProjects: Array<Project> = [];
    newProjects.push(...action.projects);
    //newProjects.map(p => p.startDate = isNullOrUndefined(p.startDate) ? new Date() : p.startDate);
    //newProjects.sort(projectsByStartDate);
    return {...profile, ...{projects: newProjects}};
}

function handleBaseProfile(action: BaseProfileLoadAction, profile: Profile): Profile {
    let newProfile = {...profile, id: action.baseProfile.id};
    newProfile = {...newProfile, ...{description: action.baseProfile.description}};
    return {...newProfile, ...{lastEdited: action.baseProfile.lastEdited}};
}

function handleUpdateEntry(action: EntryUpdateAction, profile: Profile): Profile {
    let field: Array<ProfileEntry> = profile[action.field];
    let newField = field.filter(byId(action.entry.id));
    newField.push(action.entry);
    return sortAndReplace(profile, action.field, newField);
}

function handleDeleteEntry(action: EntryDeleteAction, profile: Profile): Profile {
    let field: Array<ProfileEntry> = profile[action.field];
    let newField = field.filter(value => value.id != action.id);
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
    let newSkills = skills.filter(s => s.id !== action.id);
    newSkills.sort(skillByName);
    return {...profile, ...{skills: newSkills}};
}

function handleUpdateProject(action: ProjectUpdateAction, profile: Profile, projectIndex): Profile {
    const newProjects = replaceAtIndex(action.project, profile.projects, projectIndex);
    return {...profile, ...{projects: newProjects}};
}

function handleDeleteProject(action: ProjectDeleteAction, profile: Profile): Profile {
    let project = profile.projects;
    let newProjects = project.filter(s => s.id !== action.id);
    newProjects.sort(projectsByStartDate);
    return {...profile, ...{projects: newProjects}};
}

function handleSelectProject(selectedProjectIndex: number, store: ProfileStore): ProfileStore {
    let editedProject = getProject(selectedProjectIndex, store);
    // fix name entities
    return {...store, selectedProjectIndex, editedProject};
}

function getProject(index: number, store: ProfileStore): Project {
    if (store.profile.projects.length < index) {
        throw new Error(`Not enough projects for index ${index} available. Got ${store.profile.projects.length} in profile id = ${store.profile.id}`);
    }
    return store.profile.projects[index];
}

function cancelEditMode(store: ProfileStore): ProfileStore {
    // First we need to restore the original project
    const restored = handleSelectProject(store.selectedProjectIndex, store);
    // Now we can deactivate the edit mode
    return {...restored, ...{isProjectEditing: false}};
}



