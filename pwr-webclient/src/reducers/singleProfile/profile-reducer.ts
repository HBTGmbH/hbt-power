import {Profile} from '../../model/Profile';
import {
    ChangeStringValueAction, CreateEntryAction, DeleteEntryAction, SaveEntryAction, SaveProjectAction,
    UpdateSkillRatingAction
} from './database-actions';
import {EducationEntry} from '../../model/EducationEntry';
import {ProfileElementType} from '../../Store';
import {TrainingEntry} from '../../model/TrainingEntry';
import {LanguageSkill} from '../../model/LanguageSkill';
import {QualificationEntry} from '../../model/QualificationEntry';
import {SectorEntry} from '../../model/SectorEntry';
import {Skill} from '../../model/Skill';
import {isNull, isNullOrUndefined} from 'util';
import {Project} from '../../model/Project';
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
            default:
                return profile;
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
            default:
                return profile;
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
            default:
                break;
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
        let projectSkillIds = project.skillIDs();
       rawSkills.forEach(skillName => {
            let skill: Skill = profile.getSkillByName(skillName);
            if(isNullOrUndefined) {
                skill = Skill.createNew(skillName);
                profile = profile.skills(profile.skills().set(skill.id(), skill));
                // Add the new skill to the root category; Let server categorize this.
                profile = profile.addSkillToRoot(skill);
            }
            // Always add the skill id. IDs are represents by a set, so add can always be performed
            // without creating duplicates.
            projectSkillIds = projectSkillIds.add(skill.id());
        });
        project = project.skillIDs(projectSkillIds);
        return profile.projects(profile.projects().set(project.id(), project));
    }

    public static reducerHandleUpdateSkillRating(profile: Profile, action: UpdateSkillRatingAction): Profile {
        let skill: Skill = profile.getSkill(action.id);
        skill = skill.rating(action.rating);
        return profile.skills(profile.skills().set(skill.id(), skill));

    }
}