import {ProfileEntryType} from './model/ProfileEntryType';
import {SuggestionField} from '../../suggestions/model/SuggestionField';
import {ProfileEntryField} from './model/ProfileEntryField';
import {ProfileDataAsyncActionCreator} from './ProfileDataAsyncActionCreator';
import {ApplicationState} from '../../reducerIndex';
import {ProfileEntryDialogState} from '../../../modules/home/profile/profile-entry-edit_module';
import {newLanguage} from './model/Language';
import {isNullOrUndefined} from 'util';
import {ProfileEntry} from './model/ProfileEntry';
import {NameEntity, newNameEntity} from './model/NameEntity';
import {newEducation} from './model/Education';
import {newCareer} from './model/Career';
import {newSpecialField} from './model/SpecialField';
import {newQualification} from './model/Qualification';
import {newIndustrialSector} from './model/IndustrialSector';
import {newTraining} from './model/FurtherTraining';
import {Dispatch} from 'redux';
import {AbstractAction} from '../../BaseActions';

export class ProfileTypeDataMapper {

    public static getSuggestionField(type: ProfileEntryType): SuggestionField {
        switch (type) {
            case 'LANGUAGE': {
                return 'allLanguages' as SuggestionField;
            }
            case 'EDUCATION': {
                return 'allEducations' as SuggestionField;
            }
            case 'CAREER': {
                return 'allCareers' as SuggestionField;
            }
            case 'KEY_SKILL': {
                return 'allSpecialFields' as SuggestionField;
            }
            case 'QUALIFICATION': {
                return 'allQualifications' as SuggestionField;
            }
            case 'SECTOR': {
                return 'allIndustrialSectors' as SuggestionField;
            }
            case 'TRAINING': {
                return 'allTrainings' as SuggestionField;
            }
        }
        return null;
    }

    public static getProfileField(type: ProfileEntryType): ProfileEntryField {
        switch (type) {
            case 'LANGUAGE': {
                return 'languages' as ProfileEntryField;
            }
            case 'EDUCATION': {
                return 'education' as ProfileEntryField;
            }
            case 'CAREER': {
                return 'career' as ProfileEntryField;
            }
            case 'KEY_SKILL': {
                return 'specialFieldEntries' as ProfileEntryField;
            }
            case 'QUALIFICATION': {
                return 'qualification' as ProfileEntryField;
            }
            case 'SECTOR': {
                return 'sectors' as ProfileEntryField;
            }
            case 'TRAINING': {
                return 'training' as ProfileEntryField;
            }
        }
        return null;
    }

    public static getUpdateFunction(type: ProfileEntryType, dispatch: Dispatch<AbstractAction>) {
        switch (type) {
            case 'LANGUAGE': {
                return (initials, entry) => {
                    dispatch(ProfileDataAsyncActionCreator.saveLanguage(initials, entry));
                };
            }
            case 'EDUCATION': {
                return (initials, entry) => {
                    dispatch(ProfileDataAsyncActionCreator.saveEducation(initials, entry));
                };
            }
            case 'CAREER': {
                return (initials, entry) => {
                    dispatch(ProfileDataAsyncActionCreator.saveCareer(initials, entry));
                };
            }
            case 'KEY_SKILL': {
                return (initials, entry) => {
                    dispatch(ProfileDataAsyncActionCreator.saveKeySkill(initials, entry));
                };
            }
            case 'QUALIFICATION': {
                return (initials, entry) => {
                    dispatch(ProfileDataAsyncActionCreator.saveQualification(initials, entry));
                };
            }
            case 'SECTOR': {
                return (initials, entry) => {
                    dispatch(ProfileDataAsyncActionCreator.saveSector(initials, entry));
                };
            }
            case 'TRAINING': {
                return (initials, entry) => {
                    dispatch(ProfileDataAsyncActionCreator.saveTraining(initials, entry));
                };
            }
        }
        return null;
    }

    public static getDeleteFunction(type: ProfileEntryType, dispatch: Dispatch<ApplicationState>) {
        switch (type) {
            case 'LANGUAGE': {
                return (initials, id) => {
                    dispatch(ProfileDataAsyncActionCreator.deleteLanguage(initials, id));
                };
            }
            case 'EDUCATION': {
                return (initials, id) => {
                    dispatch(ProfileDataAsyncActionCreator.deleteEducation(initials, id));
                };
            }
            case 'CAREER': {
                return (initials, id) => {
                    dispatch(ProfileDataAsyncActionCreator.deleteCareer(initials, id));
                };
            }
            case 'KEY_SKILL': {
                return (initials, id) => {
                    dispatch(ProfileDataAsyncActionCreator.deleteKeySkill(initials, id));
                };
            }
            case 'QUALIFICATION': {
                return (initials, id) => {
                    dispatch(ProfileDataAsyncActionCreator.deleteQualification(initials, id));
                };
            }
            case 'SECTOR': {
                return (initials, id) => {
                    dispatch(ProfileDataAsyncActionCreator.deleteSector(initials, id));
                };
            }
            case 'TRAINING': {
                return (initials, id) => {
                    dispatch(ProfileDataAsyncActionCreator.deleteTraining(initials, id));
                };
            }
        }
        return null;
    }

    public static makeEntry(type: ProfileEntryType, state: ProfileEntryDialogState, entry: ProfileEntry) {
        if (isNullOrUndefined(state.searchText)) return null;
        const isNew = isNullOrUndefined(entry);
        const id = isNew ? -1 : entry.id;
        const nameId = isNew ? -1 : entry.nameEntity.id;
        let nameEntity: NameEntity = newNameEntity(nameId, state.searchText, type);
        switch (type) {
            case 'LANGUAGE': {
                if (!isNullOrUndefined(state.langLevel)) {
                    return newLanguage(id, nameEntity, state.langLevel);
                }
                break;
            }
            case 'EDUCATION': {
                if (!isNullOrUndefined(state.degree) && !isNullOrUndefined(state.startDate) && !isNullOrUndefined(state.endDate)) {
                    return newEducation(id, nameEntity, state.startDate, state.endDate, state.degree);
                }
                break;
            }
            case 'CAREER': {
                if (!isNullOrUndefined(state.startDate) && !isNullOrUndefined(state.endDate)) {
                    return newCareer(id, nameEntity, state.startDate, state.endDate);
                }
                break;
            }
            case 'KEY_SKILL': {
                    return newSpecialField(id, nameEntity);
            }
            case 'QUALIFICATION': {
                if (!isNullOrUndefined(state.startDate)) {
                    return newQualification(id, nameEntity, state.startDate);
                }
                break;
            }
            case 'SECTOR': {
                    return newIndustrialSector(id, nameEntity);
            }
            case 'TRAINING': {
                if (!isNullOrUndefined(state.startDate) && !isNullOrUndefined(state.endDate)) {
                    return newTraining(id, nameEntity, state.startDate, state.endDate);
                }
                break;
            }
        }
        return null;
    }

}
