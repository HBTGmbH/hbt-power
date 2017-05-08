import {Profile} from '../../model/Profile';
import {ChangeStringValueAction, CreateEntryAction, DeleteEntryAction, SaveEntryAction} from './database-actions';
import {EducationEntry} from '../../model/EducationEntry';
import {ProfileElementType} from '../../Store';
import {TrainingEntry} from '../../model/TrainingEntry';
import {LanguageSkill} from '../../model/LanguageSkill';
import {QualificationEntry} from '../../model/QualificationEntry';
import {SectorEntry} from '../../model/SectorEntry';
import {Project} from '../../model/Project';
export class ProfileReducer {

    public static reducerHandleChangeCurrentPosition(profile: Profile, action: ChangeStringValueAction) {
        return profile.changeCurrentPosition(action.value);
    }

    public static reducerUpdateEntry(profile: Profile, action: SaveEntryAction): Profile {
        switch(action.entryType) {
            case ProfileElementType.TrainingEntry:
                return profile.updateTrainingEntry(action.entry as TrainingEntry);
            case ProfileElementType.SectorEntry:
                return profile.updateSectorEntry(action.entry as SectorEntry);
            case ProfileElementType.EducationEntry:
                return profile.updateEducationEntry(action.entry as EducationEntry);
            case ProfileElementType.QualificationEntry:
                return profile.updateQualificationEntry(action.entry as QualificationEntry);
            case ProfileElementType.LanguageEntry:
                return profile.updateLanguageSkill(action.entry as LanguageSkill);
            case ProfileElementType.ProjectEntry:
                return profile.updateProject(action.entry as Project);
            default:
                return profile;
        }
    }

    public static reducerHandleRemoveEntry(profile: Profile, action: DeleteEntryAction): Profile {
        switch(action.elementType) {
            case ProfileElementType.TrainingEntry:
                return profile.removeCareerElement(action.elementId);
            case ProfileElementType.SectorEntry:
                return profile.removeSectorEntry(action.elementId);
            case ProfileElementType.EducationEntry:
                return profile.removeEducationEntry(action.elementId);
            case ProfileElementType.QualificationEntry:
                return profile.removeQualificationEntry(action.elementId);
            case ProfileElementType.LanguageEntry:
                return profile.removeLanguageSkill(action.elementId);
            default:
                return profile;
        }
    }

    public static reducerHandleCreateEntry(profile: Profile, action: CreateEntryAction): Profile {
        switch(action.entryType) {
            case ProfileElementType.SectorEntry:
                return profile.updateSectorEntry(SectorEntry.createNew());
            case ProfileElementType.LanguageEntry:
                return profile.updateLanguageSkill(LanguageSkill.createNew());
            case ProfileElementType.QualificationEntry:
                return profile.updateQualificationEntry(QualificationEntry.createNew());
            case ProfileElementType.TrainingEntry:
                return profile.updateTrainingEntry(TrainingEntry.createNew());
            case ProfileElementType.EducationEntry:
                return profile.updateEducationEntry(EducationEntry.createNew());
            default:
                return profile;
        }
    }
}