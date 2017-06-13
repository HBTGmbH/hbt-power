import {Profile} from '../../model/Profile';
import {
    AddSkillAction,
    ChangeStringValueAction, CreateEntryAction, DeleteEntryAction, DeleteSkillAction, SaveEntryAction,
    UpdateSkillRatingAction
} from './database-actions';
import {EducationEntry} from '../../model/EducationEntry';
import {ProfileElementType} from '../../Store';
import {TrainingEntry} from '../../model/TrainingEntry';
import {LanguageSkill} from '../../model/LanguageSkill';
import {QualificationEntry} from '../../model/QualificationEntry';
import {SectorEntry} from '../../model/SectorEntry';
import {Skill} from '../../model/Skill';
import {error, isNull, isNullOrUndefined} from 'util';
import {Project} from '../../model/Project';
import {CareerEntry} from '../../model/CareerEntry';
import {KeySkillEntry} from '../../model/KeySkillEntry';
export class ProfileReducer {

    private static updateEntry(profile: Profile, entry: any, entryType: ProfileElementType) {
        switch(entryType) {
            case ProfileElementType.TrainingEntry: {
                let tEntry: TrainingEntry = entry as TrainingEntry;
                return profile.trainingEntries(profile.trainingEntries().set(tEntry.id(), tEntry));
            }
            case ProfileElementType.SectorEntry: {
                let sEntry: SectorEntry = entry as SectorEntry;
                return profile.sectorEntries(profile.sectorEntries().set(sEntry.id(), sEntry));
            }
            case ProfileElementType.EducationEntry: {
                let eEntry: EducationEntry = entry as EducationEntry;
                return profile.educationEntries(profile.educationEntries().set(eEntry.id(), eEntry));
            }
            case ProfileElementType.QualificationEntry: {
                let qEntry: QualificationEntry = entry as QualificationEntry;
                return profile.qualificationEntries(profile.qualificationEntries().set(qEntry.id(), qEntry));
            }
            case ProfileElementType.LanguageEntry: {
                let lEntry: LanguageSkill = entry as LanguageSkill;
                return profile.languageSkills(profile.languageSkills().set(lEntry.id(), lEntry));

            }
            case ProfileElementType.CareerEntry: {
                let cEntry: CareerEntry = entry as CareerEntry;
                return profile.careerEntries(profile.careerEntries().set(cEntry.id(), cEntry));
            }
            case ProfileElementType.KeySkill: {
                let kEntry: KeySkillEntry = entry as KeySkillEntry;
                return profile.keySkillEntries(profile.keySkillEntries().set(kEntry.id(), kEntry));
            }
            default:
                throw new TypeError("Unknown switch value " + ProfileElementType[entryType]);
        }
    }

    public static reducerHandleChangeCurrentPosition(profile: Profile, action: ChangeStringValueAction) {
        return profile.currentPosition(action.value);
    }

    public static reducerUpdateEntry(profile: Profile, action: SaveEntryAction): Profile {
        return ProfileReducer.updateEntry(profile, action.entry, action.entryType);
    }

    public static reducerHandleRemoveEntry(profile: Profile, action: DeleteEntryAction): Profile {
        switch(action.elementType) {
            case ProfileElementType.TrainingEntry:
                return profile.trainingEntries(profile.trainingEntries().remove(action.elementId));
            case ProfileElementType.SectorEntry:
                return profile.sectorEntries(profile.sectorEntries().remove(action.elementId));
            case ProfileElementType.EducationEntry:
                return profile.educationEntries(profile.educationEntries().remove(action.elementId));
            case ProfileElementType.QualificationEntry:
                return profile.qualificationEntries(profile.qualificationEntries().remove(action.elementId));
            case ProfileElementType.LanguageEntry:
                return profile.languageSkills(profile.languageSkills().remove(action.elementId));
            case ProfileElementType.CareerEntry:
                return profile.careerEntries(profile.careerEntries().remove(action.elementId));
            case ProfileElementType.KeySkill:
                return profile.keySkillEntries(profile.keySkillEntries().remove(action.elementId));
            default:
                throw TypeError("Unknown switch value " + ProfileElementType[action.elementType]);
        }
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
    public static reducerHandleSaveProject(profile: Profile, project: Project, rawSkills: Immutable.Set<string>): Profile {
        // Check raw skills. If no skill with the name exists, add it to profile.
        let projectSkillIds = project.skillIDs().clear();
       rawSkills.forEach(skillName => {
            let skill: Skill = profile.getSkillByName(skillName);
            if(isNullOrUndefined(skill)) {
                skill = Skill.createNew(skillName);
                profile = profile.skills(profile.skills().set(skill.id(), skill));
            }
            // Always add the skill id. IDs are represents by a set, so add can always be performed
            // without creating duplicates.
            projectSkillIds = projectSkillIds.add(skill.id());
        });
        project = project.skillIDs(projectSkillIds);
        return profile.projects(profile.projects().set(project.id(), project));
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
        return ProfileReducer.deleteOrphanSkills(profile.skills(skills), action.id);
    }

    public static reducerHandleUpdateSkillRating(profile: Profile, action: UpdateSkillRatingAction): Profile {
        let skill: Skill = profile.getSkill(action.id);
        skill = skill.rating(action.rating);
        return profile.skills(profile.skills().set(skill.id(), skill));

    }

    public static reducerHandleAddSkill(profile: Profile, action: AddSkillAction): Profile {
        if(!profile.getSkillByName(action.skillName)) {
            let skills = profile.skills();
            let skill = Skill.createNew(action.skillName);
            skills = skills.set(skill.id(), skill);
            return profile.skills(skills);
        } else {
            return profile;
        }
    }
}