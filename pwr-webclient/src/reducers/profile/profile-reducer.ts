import {Profile} from '../../model/Profile';
import {
    AddSkillAction,
    CreateEntryAction,
    DeleteEntryAction,
    DeleteSkillAction,
    RemoveSkillFromProjectAction,
    SaveEntryAction,
    UpdateSkillRatingAction
} from './database-actions';
import {EducationEntry} from '../../model/EducationEntry';
import {ProfileElementType} from '../../Store';
import {TrainingEntry} from '../../model/TrainingEntry';
import {LanguageSkill} from '../../model/LanguageSkill';
import {QualificationEntry} from '../../model/QualificationEntry';
import {SectorEntry} from '../../model/SectorEntry';
import {Skill} from '../../model/Skill';
import {error, isNullOrUndefined} from 'util';
import {Project} from '../../model/Project';
import {CareerEntry} from '../../model/CareerEntry';
import {KeySkillEntry} from '../../model/KeySkillEntry';
export class ProfileReducer {

    private static updateEntry(profile: Profile, entry: any, entryType: ProfileElementType) {
        switch(entryType) {
            case ProfileElementType.TrainingEntry: {
                let tEntry: TrainingEntry = entry as TrainingEntry;
                profile = profile.trainingEntries(profile.trainingEntries().set(tEntry.id(), tEntry));
                break;
            }
            case ProfileElementType.SectorEntry: {
                let sEntry: SectorEntry = entry as SectorEntry;
                profile = profile.sectorEntries(profile.sectorEntries().set(sEntry.id(), sEntry));
                break;
            }
            case ProfileElementType.EducationEntry: {
                let eEntry: EducationEntry = entry as EducationEntry;
                profile = profile.educationEntries(profile.educationEntries().set(eEntry.id(), eEntry));
                break;
            }
            case ProfileElementType.QualificationEntry: {
                let qEntry: QualificationEntry = entry as QualificationEntry;
                profile = profile.qualificationEntries(profile.qualificationEntries().set(qEntry.id(), qEntry));
                break;
            }
            case ProfileElementType.LanguageEntry: {
                let lEntry: LanguageSkill = entry as LanguageSkill;
                profile = profile.languageSkills(profile.languageSkills().set(lEntry.id(), lEntry));
                break;
            }
            case ProfileElementType.CareerEntry: {
                let cEntry: CareerEntry = entry as CareerEntry;
                profile = profile.careerEntries(profile.careerEntries().set(cEntry.id(), cEntry));
                break;
            }
            case ProfileElementType.KeySkill: {
                let kEntry: KeySkillEntry = entry as KeySkillEntry;
                profile = profile.keySkillEntries(profile.keySkillEntries().set(kEntry.id(), kEntry));
                break;
            }
            default:
                throw new TypeError("Unknown switch value " + ProfileElementType[entryType]);
        }
        return profile.changesMade(profile.changesMade() + 1);
    }


    public static reducerUpdateEntry(profile: Profile, action: SaveEntryAction): Profile {
        return ProfileReducer.updateEntry(profile, action.entry, action.entryType);
    }

    public static reducerHandleRemoveEntry(profile: Profile, action: DeleteEntryAction): Profile {
        switch(action.elementType) {
            case ProfileElementType.TrainingEntry:
                profile = profile.trainingEntries(profile.trainingEntries().remove(action.elementId));
                break;
            case ProfileElementType.SectorEntry:
                profile = profile.sectorEntries(profile.sectorEntries().remove(action.elementId));
                break;
            case ProfileElementType.EducationEntry:
                profile = profile.educationEntries(profile.educationEntries().remove(action.elementId));
                break;
            case ProfileElementType.QualificationEntry:
                profile = profile.qualificationEntries(profile.qualificationEntries().remove(action.elementId));
                break;
            case ProfileElementType.LanguageEntry:
                profile = profile.languageSkills(profile.languageSkills().remove(action.elementId));
                break;
            case ProfileElementType.CareerEntry:
                profile = profile.careerEntries(profile.careerEntries().remove(action.elementId));
                break;
            case ProfileElementType.KeySkill:
                profile = profile.keySkillEntries(profile.keySkillEntries().remove(action.elementId));
                break;
            default:
                throw TypeError("Unknown switch value " + ProfileElementType[action.elementType]);
        }
        return profile.changesMade(profile.changesMade() + 1);
    }

    public static reducerHandleCreateEntry(profile: Profile, action: CreateEntryAction): Profile {
        let entry: any;
        switch(action.entryType) {
            case ProfileElementType.SectorEntry:
                entry = SectorEntry.createNew();
                break;
            case ProfileElementType.LanguageEntry:
                entry = LanguageSkill.createNew();
                break;
            case ProfileElementType.QualificationEntry:
                entry = QualificationEntry.createNew();
                break;
            case ProfileElementType.TrainingEntry:
                entry = TrainingEntry.createNew();
                break;
            case ProfileElementType.EducationEntry:
                entry = EducationEntry.createNew();
                break;
            case ProfileElementType.CareerEntry:
                entry = CareerEntry.createNew();
                break;
            case ProfileElementType.KeySkill:
                entry = KeySkillEntry.createNew();
                break;
            default:
                throw error("Unknown switch value " + ProfileElementType[action.entryType]);
        }
        return ProfileReducer.updateEntry(profile, entry, action.entryType);
    }

    /**
     * Saves a project.
     * - Checks skills for existence and creates new skills if none are found.
     * - adds skill ids to the project.
     * - updates the project in the profiles project list with the project given in action
     * and the skill ids of that project updates (but nothing else)
     * @param profile
     * @param project
     * @param rawSkills
     * @returns {Profile}
     */
    public static reducerHandleSaveProject(profile: Profile, project: Project): Profile {
        return profile.projects(profile.projects().set(project.id(), project)).changesMade(profile.changesMade());
    }

    /**
     * Deletes possible orphan skills that might have been created when a skill has been deleted.
     * @param profile
     * @param deletedId
     * @returns {Profile}
     */
    private static deleteOrphanSkills(profile: Profile, deletedId: string): Profile {
        // Orphans in projects
        let projects = profile.projects().map((project, id) => {
            if(project.skillIDs().has(deletedId)) {
                return project.skillIDs(project.skillIDs().remove(deletedId));
            }
            return project;
        }).toMap();
        return profile.projects(projects);
    }

    public static reducerHandleDeleteSkill(profile: Profile, action: DeleteSkillAction): Profile {
        let skills = profile.skills();
        skills = skills.remove(action.id);
        profile = ProfileReducer.deleteOrphanSkills(profile.skills(skills), action.id);
        return profile.changesMade(profile.changesMade() + 1);
    }

    public static reducerHandleRemoveSkillFromProject(profile: Profile, action: RemoveSkillFromProjectAction): Profile {
        let project = profile.getProject(action.projectId);
        if(!isNullOrUndefined(project)) {
            project = project.skillIDs(project.skillIDs().remove(action.skillId));
            let projects = (profile.projects());
            projects = projects.set(project.id(), project);
            profile = profile.projects(projects);
        }
        return profile;
    }

    public static reducerHandleUpdateSkillRating(profile: Profile, action: UpdateSkillRatingAction): Profile {
        let skill: Skill = profile.getSkill(action.id);
        skill = skill.rating(action.rating);
        profile = profile.skills(profile.skills().set(skill.id(), skill));
        profile = profile.changesMade(profile.changesMade() + 1);
        return profile;

    }

    public static reducerHandleAddSkill(profile: Profile, action: AddSkillAction): Profile {
        let skill = profile.getSkillByName(action.skillName);
        if(isNullOrUndefined(skill)) {
            let skills = profile.skills();
            skill = Skill.of(action.skillName, action.rating, action.comment);
            skills = skills.set(skill.id(), skill);
            profile = profile.skills(skills).changesMade(profile.changesMade() + 1);
        }
        if(!isNullOrUndefined(action.projectId)) {
            let project = profile.projects().get(action.projectId);
            project = project.skillIDs(project.skillIDs().add(skill.id()));
            let projects = profile.projects();
            projects = projects.set(project.id(), project);
            profile = profile.projects(projects);
        }
        return profile;
    }
}