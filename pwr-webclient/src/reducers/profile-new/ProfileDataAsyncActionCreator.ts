import * as redux from 'redux';
import {APIRequestType} from '../../Store';
import {ProfileActionCreator} from '../profile/ProfileActionCreator';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';
import {ApplicationState} from '../reducerIndex';
import {
    APICareerEntry, APIEducationEntry,
    APIKeySkill,
    APILanguageSkill, APIProject,
    APIQualificationEntry,
    APISectorEntry, APISkill, APITrainingEntry
} from '../../model/APIProfile';
import {NavigationActionCreator} from '../navigation/NavigationActionCreator';
import {entryUpdateAction, EntryUpdateAction} from './actions/EntryUpdateAction';
import {Language} from './model/Language';

const profileServiceClient = ProfileServiceClient.instance();

const succeedCall = (type: APIRequestType, dispatch: redux.Dispatch<ApplicationState>) => {
    return (data: any) => dispatch(ProfileActionCreator.APIRequestSuccessful(data, type));
};

export class ProfileDataAsyncActionCreator {


    public static loadProfile(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getProfile(initials)
                .then(profile => dispatch(ProfileActionCreator.APIRequestSuccessful(profile, APIRequestType.RequestProfile)))
                .catch(console.error);
        };
    }

    // --------------------------- ---------------------- Language ---------------------- ----------------------------//
    public static saveLanguage(initials: string, entity: Language) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveLanguage(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Sprache: ' + entity.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(entity,'languages'));
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteLanguage(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteLanguage(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- Qualification ---------------------- ----------------------------//
    public static saveQualification(initials: string, entity: APIQualificationEntry) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveQualification(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Qualifikation: ' + entity.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteQualification(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteQualification(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- Sector ---------------------- ----------------------------//
    public static saveSector(initials: string, entity: APISectorEntry) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveSector(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Branche: ' + entity.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteSector(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteSector(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- KeySkill ---------------------- ----------------------------//
    public static saveKeySkill(initials: string, entity: APIKeySkill) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveKeySkill(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Spezialgebiet: ' + entity.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteKeySkill(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteKeySkill(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- Career ---------------------- ----------------------------//
    public static saveCareer(initials: string, entity: APICareerEntry) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveCareer(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Werdegang: ' + entity.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteCareer(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteCareer(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- Training ---------------------- ----------------------------//
    public static saveTraining(initials: string, entity: APITrainingEntry) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveTraining(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Weiterbildung: ' + entity.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteTraining(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteTraining(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- Education ---------------------- ----------------------------//
    public static saveEducation(initials: string, entity: APIEducationEntry) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveEducation(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Ausbildung: ' + entity.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteEducation(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteEducation(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- Skill ---------------------- ----------------------------//
    public static saveProfileSkill(initials: string, entity: APISkill) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveProfileSkill(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Skill: ' + entity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteProfileSkill(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteProfileSkill(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }

    // --------------------------- ---------------------- Projects ---------------------- ----------------------------//
    public static saveProject(initials: string, entity: APIProject) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.saveProject(initials, entity).then(value => {
                    NavigationActionCreator.showSuccess('Project: ' + entity.name + ' erfolgreich hinzugefügt!');
                    dispatch(ProfileActionCreator.APIRequestSuccessful(value, APIRequestType.SaveProfile)); // TODO neu implementieren
                    // TODO die mögliche änderung der profilskill beachten
                }
            ).catch(error => NavigationActionCreator.showError(error));
        };
    }

    public static deleteProject(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.deleteProject(initials, id).then(value => {
                    console.log('neu laden des profiles'); // TODO
                }
            ).catch(error => console.error(error));
        };
    }
}