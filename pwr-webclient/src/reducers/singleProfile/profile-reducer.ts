import {Profile} from '../../model/Profile';
import {ChangeItemIdAction} from './singleProfileActions';
import {EducationEntry} from '../../model/EducationEntry';
import {ProfileElementType} from '../../Store';
import {CareerElement} from '../../model/CareerElement';
import {LanguageSkill} from '../../model/LanguageSkill';
import {QualificationEntry} from '../../model/QualificationEntry';
export class ProfileReducer {

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
            default:
                return profile;
        }
    }
}