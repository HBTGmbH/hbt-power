import {Profile} from '../../model/Profile';
import {
    ChangeDateAction, ChangeItemIdAction, ChangeStringValueAction, CreateEntryAction,
    DeleteEntryAction
} from './singleProfileActions';
import {EducationEntry} from '../../model/EducationEntry';
import {DateFieldType, ProfileElementType} from '../../Store';
import {CareerElement} from '../../model/CareerElement';
import {LanguageSkill} from '../../model/LanguageSkill';
import {QualificationEntry} from '../../model/QualificationEntry';
import {SectorEntry} from '../../model/SectorEntry';
export class ProfileReducer {

    public static reducerHandleChangeCurrentPosition(profile: Profile, action: ChangeStringValueAction) {
        return profile.changeCurrentPosition(action.value);
    }

    public static reducerHandleItemIdChange(profile: Profile, action: ChangeItemIdAction): Profile {
        switch(action.elementType) {
            case ProfileElementType.CareerEntry: {
                let newCareerElement: CareerElement = profile.careerElements.get(action.entryId);
                newCareerElement = newCareerElement.changeCareerPositionId(action.newItemId);
                return profile.updateCareerElement(newCareerElement);
            }
            case ProfileElementType.EducationEntry: {
                let newEducationEntry: EducationEntry = profile.educationEntries.get(action.entryId);
                newEducationEntry = newEducationEntry.changeEducationId(action.newItemId);
                return profile.updateEducationEntry(newEducationEntry);
            }
            case ProfileElementType.LanguageEntry: {
                let newLanguageSkill: LanguageSkill = profile.languageSkills.get(action.entryId);
                newLanguageSkill = newLanguageSkill.changeLanguageId(action.newItemId);
                return profile.updateLanguageSkill(newLanguageSkill);
            }
            case ProfileElementType.QualificationEntry: {
                let newQualificationEntry: QualificationEntry = profile.qualificationEntries.get(action.entryId);
                newQualificationEntry = newQualificationEntry.changeQualificationId(action.newItemId);
                return profile.updateQualificationEntry(newQualificationEntry);
            }
            case ProfileElementType.SectorEntry: {
                let newSectorEntry: SectorEntry = profile.sectors.get(action.entryId);
                newSectorEntry = newSectorEntry.changeSectorId(action.newItemId);
                return profile.updateSectorEntry(newSectorEntry);
            }
            default:
                return profile;
        }
    }

    public static reducerHandleRemoveEntry(profile: Profile, action: DeleteEntryAction): Profile {
        switch(action.elementType) {
            case ProfileElementType.CareerEntry:
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
            case ProfileElementType.CareerEntry:
                return profile.updateCareerElement(CareerElement.createNew());
            case ProfileElementType.EducationEntry:
                return profile.updateEducationEntry(EducationEntry.createNew());
            default:
                return profile;
        }
    }

    public static reducerHandleChangeDate(profile: Profile, action: ChangeDateAction): Profile {
        switch (action.targetField) {
            case DateFieldType.CareerFrom: {
                let element: CareerElement = profile.careerElements.get(action.targetFieldId);
                element = element.changeStartDate(action.newDate);
                return profile.updateCareerElement(element);
            }
            case DateFieldType.CareerTo: {
                let element: CareerElement = profile.careerElements.get(action.targetFieldId);
                element = element.changeEndDate(action.newDate);
                return profile.updateCareerElement(element);
            }
            case DateFieldType.EducationDate: {
                let educationEntry: EducationEntry = profile.educationEntries.get(action.targetFieldId);
                educationEntry = educationEntry.changeDate(action.newDate);
                return profile.updateEducationEntry(educationEntry);
            }
            case DateFieldType.QualificationDate: {
                let qualificationEntry: QualificationEntry = profile.qualificationEntries.get(action.targetFieldId);
                qualificationEntry = qualificationEntry.changeDate(action.newDate);
                return profile.updateQualificationEntry(qualificationEntry);
            }
            default:
                return profile;
        }
    }
}