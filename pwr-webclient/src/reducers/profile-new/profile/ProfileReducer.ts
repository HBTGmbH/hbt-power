import {emptyStore, ProfileStore} from '../ProfileStore';
import {ActionType} from '../../ActionType';
import {Profile} from './model/Profile';
import {ProfileEntry} from './model/ProfileEntry';
import {ComparatorBuilder} from 'ts-comparator';
import {ProfileEntryField} from './model/ProfileEntryField';
import {ProfileSkill} from './model/ProfileSkill';
import {emptyProject, Project} from './model/Project';
import {ConsultantUpdateAction} from '../consultant/actions/ConsultantUpdateAction';
import {
    ProjectDeleteAction,
    ProjectLoadAction,
    ProjectUpdateAction,
    SelectProjectAction,
    SetEditingProjectAction
} from './actions/ProjectActions';
import {immutableUnshift} from '../../../utils/ImmutableUtils';
import {PROJECTS_BY_START_DATE} from '../../../utils/Comparators';
import {AbstractAction} from '../../BaseActions';
import {
    BaseProfileLoadAction,
    EntryDeleteAction,
    EntryLoadAction,
    EntryUpdateAction, ProfileLoadAction, SetDescriptionAction,
    SkillDeleteAction,
    SkillLoadAction,
    SkillUpdateAction
} from './actions/ProfileActions';


export function reduceProfile(store: ProfileStore = emptyStore, action: AbstractAction): ProfileStore {
    switch (action.type) {
        case ActionType.ResetProfileStore: {
            return emptyStore;
        }
        case ActionType.LoadProfileAction: {
            const act = action as ProfileLoadAction;
            const projects = [...(act.profile.projects || [])].sort(PROJECTS_NEWEST_FIRST);
            return withSelectionById(replaceProfile(store, {...act.profile, projects}));
        }
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
            const saved = (action as ProjectUpdateAction).project;
            const profile = handleUpdateProject(saved, store.profile);
            return {
                ...replaceProfile(store, profile),
                isProjectEditing: false,
                selectedProject: saved,
                // The start date may have changed, so the project may have moved
                selectedProjectIndex: profile.projects.findIndex(project => project.id === saved.id)
            };
        }
        case ActionType.DeleteProjectSuccessful: {
            const deletedId = (action as ProjectDeleteAction).id;
            const profile = handleDeleteProject(action as ProjectDeleteAction, store.profile);
            const selected = store.selectedProject;
            if (!selected || selected.id === deletedId) {
                return {...store, profile, selectedProject: null, selectedProjectIndex: -1, isProjectEditing: false};
            }
            // Deleted from the list while another project is open (#145): keep it and its unsaved changes
            return {...store, profile, selectedProjectIndex: profile.projects.findIndex(project => project.id === selected.id)};
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
            return withSelectionById(replaceProfile(store, profile));
        }
        case ActionType.LoadBaseProfileAction: {
            let profile = handleBaseProfile(action as BaseProfileLoadAction, store.profile);
            return replaceProfile(store, profile);
        }
        case ActionType.UpdateConsultantAction: {
            return handleConsultantUpdate(action as ConsultantUpdateAction, store);
        }
        case ActionType.SelectProject: {
            const selectedIndex = (action as SelectProjectAction).value;
            if (selectedIndex === store.selectedProjectIndex) {
                // Index did not change, do nothing!
                return store;
            }
            if (store.selectedProject && !store.selectedProject.id) {
                // New Project. Delete it
                return cancelEditOnNewProject(store, selectedIndex - 1);
            }
            return handleSelectProject(selectedIndex, cancelEditMode(store));
        }
        case ActionType.SetEditingProject: {
            // No read mode (#338): every change starts editing, which keeps it over reloads until saved or discarded
            const editedProject = (action as SetEditingProjectAction).project;
            return {...store, selectedProject: editedProject, isProjectEditing: true};
        }
        case ActionType.CancelEditSelectedProject: {
            if (store.selectedProject.id === null) {
                return cancelEditOnNewProject(store);
            } else {
                return cancelEditMode(store);
            }
        }
        case ActionType.DiscardProjectChanges: {
            if (!store.selectedProject) {
                return store;
            }
            return store.selectedProject.id === null ? cancelEditOnNewProject(store) : cancelEditMode(store);
        }
        case ActionType.AddNewProject: {
            return handleAddProject(store);
        }
        case ActionType.SetDescription: {
            let description = (action as SetDescriptionAction).description;
            return replaceProfile(store, {...store.profile, description});
        }
    }
    return store;
}

const skillByName = ComparatorBuilder.comparing<ProfileSkill>(t => t.name).build();
/**
 * The one order of projects in the store and in the project list: newest start date first.
 */
const PROJECTS_NEWEST_FIRST = (a: Project, b: Project) => PROJECTS_BY_START_DATE(b, a);

/**
 * After the projects were replaced (load, reload), points the selection at the same project again, found by id.
 * Outside the edit mode the selected project is refreshed with the loaded data.
 */
function withSelectionById(store: ProfileStore): ProfileStore {
    const selected = store.selectedProject;
    if (!selected) {
        return store;
    }
    if (selected.id === null) {
        // An unsaved new project is not part of loaded data: keep it in front
        const withNewProject = store.profile.projects.indexOf(selected) >= 0 ? store : addProject(store, selected);
        return {...withNewProject, selectedProjectIndex: withNewProject.profile.projects.indexOf(selected)};
    }
    const index = store.profile.projects.findIndex(project => project.id === selected.id);
    if (index < 0) {
        return {...store, selectedProject: null, selectedProjectIndex: -1, isProjectEditing: false};
    }
    const selectedProject = store.isProjectEditing ? selected : store.profile.projects[index];
    return {...store, selectedProjectIndex: index, selectedProject};
}
const byName = ComparatorBuilder.comparing<ProfileEntry>(t => t.nameEntity.name).build();
const byId = (id: number) => (other: ProfileEntry) => other.id !== id;

function handleAddProject(store: ProfileStore): ProfileStore {
    // 1. Add a new project
    // 2. Select the new project
    // 3. Enter edit mode
    const withNewProject = addProject(store, emptyProject());
    const withNewProjectSelected = handleSelectProject(0, withNewProject);
    return handleSetEditMode(withNewProjectSelected);
}

function handleConsultantUpdate(action: ConsultantUpdateAction, store: ProfileStore): ProfileStore {
    return {...store, consultant: action.consultant};
}

function replaceProfile(store: ProfileStore, profile: Profile): ProfileStore {
    return {...store, ...{profile: profile}};
}

function sortAndReplace(profile: Profile, field: ProfileEntryField, collection: Array<ProfileEntry>) {
    collection.filter(e => !!(e));
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
    let newProjects: Array<Project> = action
        .projects
        .sort(PROJECTS_NEWEST_FIRST);
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
    let newField = field.filter(value => value.id !== action.id);
    return sortAndReplace(profile, action.field, newField);
}

function handleUpdateSkill(action: SkillUpdateAction, profile: Profile): Profile {
    let skills = profile.skills;
    let newSkills = skills.filter(s => s.id !== action.skill.id);
    newSkills.push(action.skill);
    newSkills.sort(skillByName);
    return {...profile, ...{skills: newSkills}};
}

function handleDeleteSkill(action: SkillDeleteAction, profile: Profile): Profile {
    let skills = profile.skills;
    let newSkills = skills.filter(s => s.id !== action.id);
    newSkills.sort(skillByName);
    // The service takes the skill out of the projects of the profile too (#254)
    const newProjects = profile.projects.map(project => project.skills.some(s => s.id === action.id)
        ? {...project, skills: project.skills.filter(s => s.id !== action.id)}
        : project);
    return {...profile, ...{skills: newSkills, projects: newProjects}};
}

function handleUpdateProject(saved: Project, profile: Profile): Profile {
    // Replace the saved project, or the unsaved new project (id null) it was created from
    const newProjects = profile.projects.filter(project => project.id !== saved.id && project.id !== null);
    newProjects.push(saved);
    newProjects.sort(PROJECTS_NEWEST_FIRST);
    return {...profile, ...{projects: newProjects}};
}

function handleDeleteProject(action: ProjectDeleteAction, profile: Profile): Profile {
    let project = profile.projects;
    let newProjects = project.filter(s => s.id !== action.id);
    newProjects.sort(PROJECTS_NEWEST_FIRST);
    return {...profile, ...{projects: newProjects}};
}

function deleteProjectFromProfile(id: number, store: ProfileStore): ProfileStore {
    let project = store.profile.projects;
    let newProjects = project.filter(s => s.id !== id);
    newProjects.sort(PROJECTS_NEWEST_FIRST);
    return replaceProfile(store, {...store.profile, ...{projects: newProjects}});
}

function handleSelectProject(selectedProjectIndex: number, store: ProfileStore): ProfileStore {
    let editedProject = getProject(selectedProjectIndex, store);
    return {...store, selectedProjectIndex, selectedProject: editedProject};
}

function getProject(index: number, store: ProfileStore): Project {
    if (store.profile.projects.length < index) {
        throw new Error(`Not enough projects for index ${index} available. Got ${store.profile.projects.length} in profile id = ${store.profile.id}`);
    }
    return store.profile.projects[index];
}

function addProject(store: ProfileStore, project: Project): ProfileStore {
    const projects = immutableUnshift(project, store.profile.projects);
    const profile: Profile = {...store.profile, projects};
    return {
        ...store,
        profile
    };
}

function handleSetEditMode(store: ProfileStore): ProfileStore {
    return {...store, ...{isProjectEditing: true}};
}

function cancelEditOnNewProject(store: ProfileStore, indexToJumpTo = null): ProfileStore {
    const withDeletedProject = deleteProjectFromProfile(store.selectedProject.id, store);
    let selectedProject = null;
    if (indexToJumpTo !== null) {
        selectedProject = getProject(indexToJumpTo, withDeletedProject);
    }
    return {...withDeletedProject, ...{isProjectEditing: false, selectedProjectIndex: indexToJumpTo, selectedProject}};
}

function cancelEditMode(store: ProfileStore): ProfileStore {
    // First we need to restore the original project
    const restored = handleSelectProject(store.selectedProjectIndex, store);
    // Now we can deactivate the edit mode
    return {...restored, ...{isProjectEditing: false}};
}
