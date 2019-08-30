import * as redux from 'redux';
import {ApplicationState} from '../../reducerIndex';
import {NavigationActionCreator} from '../../navigation/NavigationActionCreator';
import {Language} from './model/Language';
import {Profile} from './model/Profile';
import {ProfileEntry} from './model/ProfileEntry';
import {Project} from './model/Project';
import {ProfileSkill} from './model/ProfileSkill';
import {Qualification} from './model/Qualification';
import {IndustrialSector} from './model/IndustrialSector';
import {SpecialField} from './model/SpecialField';
import {Career} from './model/Career';
import {FurtherTraining} from './model/FurtherTraining';
import {Education} from './model/Education';
import {ProfileUpdateServiceClient} from './client/ProfileUpdateServiceClient';
import {isNullOrUndefined} from 'util';
import {projectDeleteAction, projectLoadAction, projectUpdateSuccessAction} from './actions/ProjectActions';
import success = NavigationActionCreator.success;
import {Alerts} from '../../../utils/Alerts';
import axios from 'axios';
import {
    baseProfileLoadAction,
    entryDeleteAction,
    entryLoadAction,
    entryUpdateAction, profileLoadAction, skillDeleteAction,
    skillLoadAction, skillUpdateAction
} from './actions/ProfileActions';
import {AbstractAction} from '../../BaseActions';
import {DeferrableAsyncAction} from '../../deferred/DeferrableAsyncAction';
import {makeDeferrable} from '../../deferred/AsyncActionUnWrapper';
import {ActionType} from '../../ActionType';
import {ProfileEntryTypeName} from './model/ProfileEntryType';

const profileUpdateServiceClient = ProfileUpdateServiceClient.instance();

const handleError = (error: any) => {
    Alerts.showError(error.status + ' -- ' + error.message);
    console.error(error);
};

export class ProfileDataAsyncActionCreator {


    public static loadBaseProfile(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getBaseProfile(initials).then(profile => {
                    dispatch(baseProfileLoadAction(profile));
                }
            ).catch(error => handleError(error));
        };
    }

    public static saveDescription(description: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            const initials = getState().profileStore.consultant.initials;
            profileUpdateServiceClient.saveDescription(initials, description)
                .then(profile => dispatch(baseProfileLoadAction(profile)))
                .then(ignored => Alerts.showLocalizedSuccess('Action.SaveDescription.Success'))
                .catch(handleError);
        };
    }


    public static loadFullProfileInParts(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            if (!isNullOrUndefined(initials) && initials.length > 0) {
                dispatch(ProfileDataAsyncActionCreator.loadBaseProfile(initials));
                dispatch(ProfileDataAsyncActionCreator.loadLanguage(initials));
                dispatch(ProfileDataAsyncActionCreator.loadQualification(initials));
                dispatch(ProfileDataAsyncActionCreator.loadSector(initials));
                dispatch(ProfileDataAsyncActionCreator.loadKeySkill(initials));
                dispatch(ProfileDataAsyncActionCreator.loadCareer(initials));
                dispatch(ProfileDataAsyncActionCreator.loadTraining(initials));
                dispatch(ProfileDataAsyncActionCreator.loadEducation(initials));
                dispatch(ProfileDataAsyncActionCreator.loadProfileSkills(initials));
                dispatch(ProfileDataAsyncActionCreator.loadAllProjects(initials));
            } else {
                // Get Initials
            }
        };
    }

    public static loadFullProfile(initials:string) {
        return function (dispatch:redux.Dispatch<ApplicationState>) {
            if (!!initials && initials.length > 0){
                profileUpdateServiceClient.getFullProfile(initials).then(value => {
                    dispatch(profileLoadAction(value));
                })
            }
        }
    }


    // --------------------------- ---------------------- Language ---------------------- ----------------------------//
    public static saveLanguage(initials: string, entity: Language) {
        return (dispatch: redux.Dispatch<AbstractAction>) => {
            profileUpdateServiceClient.saveLanguage(initials, entity).then(value => {
                Alerts.showSuccess('Sprache: ' + value.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.LANGUAGE as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteLanguage(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<AbstractAction>) {
            profileUpdateServiceClient.deleteLanguage(initials, id).then(value => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.LANGUAGE as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadLanguage(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getLanguages(initials).then(value =>
                dispatch(entryLoadAction(value, ProfileEntryTypeName.LANGUAGE as keyof Profile & Array<ProfileEntry>))
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Qualification ---------------------- ----------------------------//
    public static saveQualification(initials: string, entity: Qualification) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.saveQualification(initials, entity).then(value => {
                Alerts.showSuccess('Qualifikation: ' + value.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.QUALIFICATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteQualification(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteQualification(initials, id).then(value => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.QUALIFICATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadQualification(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getQualifications(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.QUALIFICATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Sector ---------------------- ----------------------------//
    public static saveSector(initials: string, entity: IndustrialSector) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.saveSector(initials, entity).then(value => {
                Alerts.showSuccess('Branche: ' + value.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.SECTOR as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteSector(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteSector(initials, id).then(value => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.SECTOR as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }


    public static loadSector(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getSectors(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.SECTOR as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- SpecialField ---------------------- ----------------------------//
    public static saveKeySkill(initials: string, entity: SpecialField) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.saveSpecialField(initials, entity).then(value => {
                Alerts.showSuccess('Spezialgebiet: ' + value.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.SPECIAL_FIELD as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteKeySkill(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteSpecialField(initials, id).then(value => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.SPECIAL_FIELD as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadKeySkill(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getSpecialFields(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.SPECIAL_FIELD as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Career ---------------------- ----------------------------//
    public static saveCareer(initials: string, entity: Career) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.saveCareer(initials, entity).then(value => {
                Alerts.showSuccess('Werdegang: ' + value.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.CAREER as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteCareer(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteCareer(initials, id).then(value => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.CAREER as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }


    public static loadCareer(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getCareers(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.CAREER as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Training ---------------------- ----------------------------//
    public static saveTraining(initials: string, entity: FurtherTraining) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.saveTraining(initials, entity).then(value => {
                Alerts.showSuccess('Weiterbildung: ' + value.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.TRAINING as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteTraining(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteTraining(initials, id).then(value => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.TRAINING as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }


    public static loadTraining(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getTrainings(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.TRAINING as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Education ---------------------- ----------------------------//
    public static saveEducation(initials: string, entity: Education) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.saveEducation(initials, entity).then(value => {
                Alerts.showSuccess('Ausbildung: ' + value.nameEntity.name + ' erfolgreich hinzugefügt!');
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.EDUCATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteEducation(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteEducation(initials, id).then(value => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.EDUCATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadEducation(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getEducation(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.EDUCATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Skill ---------------------- ----------------------------//
    public static saveProfileSkill(initials: string, entity: ProfileSkill) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.saveProfileSkill(initials, entity)
                .then(value => dispatch(skillUpdateAction(value)))
                .then(success(`Skill ${entity.name} has been saved.`))
                .catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteProfileSkill(initials: string, skill: ProfileSkill) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteProfileSkill(initials, skill.id)
                .then(value => dispatch(skillDeleteAction(skill.id)))
                .then(success(`Skill ${skill.name} has been deleted.`))
                .catch(error => handleError(error));
        };
    }

    public static loadProfileSkills(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.getSkills(initials).then(value => {
                    dispatch(skillLoadAction(value));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Projects ---------------------- ----------------------------//
    public static saveSelectedProject() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            const selectedProject = getState().profileStore.selectedProject;
            const initials = getState().profileStore.consultant.initials;
            profileUpdateServiceClient.saveProject(initials, selectedProject)
                .then(restoreProjectDates)
                .then(project => {
                    dispatch(projectUpdateSuccessAction(project));
                    dispatch(ProfileDataAsyncActionCreator.loadProfileSkills(initials));
                    Alerts.showSuccess('Project: ' + project.name + ' saved.');
                })
                .catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteProject(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient.deleteProject(initials, id).then(value => {
                    dispatch(projectDeleteAction(id));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadAllProjects(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileUpdateServiceClient
                .getProjects(initials)
                .then(restoreProjectsDates)
                .then(value => dispatch(projectLoadAction(value)))
                .catch(error => handleError(error));
        };
    }
}

function restoreProjectsDates(projects: Array<Project>): Array<Project> {
    return projects.map(project => restoreProjectDates(project));
}

function restoreProjectDates(project: Project): Project {
    project.startDate = restoreDate(project.startDate as any);
    project.endDate = restoreDate(project.endDate as any);
    return project;
}

function restoreDate(dateString: string): Date {
    if (!dateString) {
        return null;
    }
    return new Date(dateString);
}
