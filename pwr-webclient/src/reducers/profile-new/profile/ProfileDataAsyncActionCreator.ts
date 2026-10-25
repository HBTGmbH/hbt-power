import * as redux from 'redux';
import {ApplicationState} from '../../reducerIndex';
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
import {projectDeleteAction, projectLoadAction, projectUpdateSuccessAction} from './actions/ProjectActions';
import {saveInOrder} from '../../../utils/SaveQueue';
import {
    baseProfileLoadAction,
    entryDeleteAction,
    entryLoadAction,
    entryUpdateAction,
    profileLoadAction,
    skillDeleteAction,
    skillLoadAction,
    skillUpdateAction
} from './actions/ProfileActions';
import {AbstractAction} from '../../BaseActions';
import {makeDeferrable} from '../../deferred/AsyncActionUnWrapper';
import {ActionType} from '../../ActionType';
import {ProfileEntryTypeName} from './model/ProfileEntryType';
import {ThunkDispatch} from 'redux-thunk';

const profileUpdateServiceClient = ProfileUpdateServiceClient.instance();

const skillQueue = (initials: string, skillId: number) => 'profile-skill/' + initials + '/' + skillId;

/** The client has shown the error, and the state stays as it was (#320) */
const handleError = (error: any) => console.error(error);

export class ProfileDataAsyncActionCreator {


    public static loadBaseProfile(initials: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileUpdateServiceClient.getBaseProfile(initials).then(profile => {
                    dispatch(baseProfileLoadAction(profile));
                }
            ).catch(error => handleError(error));
        };
    }

    public static saveDescription(description: string) {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            const initials = getState().profileStore.consultant.initials;
            profileUpdateServiceClient.saveDescription(initials, description)
                .then(profile => dispatch(baseProfileLoadAction(profile)))
                .catch(handleError);
        };
    }


    public static loadFullProfileInParts(initials: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            if (initials && initials.length > 0) {
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

    public static loadFullProfile(initials: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            if (!!initials && initials.length > 0) {
                profileUpdateServiceClient.getFullProfile(initials).then(value => {
                    if (value) {
                        dispatch(profileLoadAction(value));
                    }
                }).catch(error => console.error('Failed to load profile', error));
            }
        };
    }


    // --------------------------- ---------------------- Language ---------------------- ----------------------------//
    public static saveLanguage(initials: string, entity: Language) {
        return (dispatch: redux.Dispatch<AbstractAction>) => {
            profileUpdateServiceClient.saveLanguage(initials, entity).then(value => {
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.LANGUAGE as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteLanguage(initials: string, id: number) {
        return function (dispatch: redux.Dispatch<AbstractAction>) {
            profileUpdateServiceClient.deleteLanguage(initials, id).then(() => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.LANGUAGE as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadLanguage(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getLanguages(initials).then(value =>
                dispatch(entryLoadAction(value, ProfileEntryTypeName.LANGUAGE as keyof Profile & Array<ProfileEntry>))
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Qualification ---------------------- ----------------------------//
    public static saveQualification(initials: string, entity: Qualification) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.saveQualification(initials, entity).then(value => {
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.QUALIFICATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteQualification(initials: string, id: number) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteQualification(initials, id).then(() => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.QUALIFICATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadQualification(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getQualifications(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.QUALIFICATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Sector ---------------------- ----------------------------//
    public static saveSector(initials: string, entity: IndustrialSector) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.saveSector(initials, entity).then(value => {
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.SECTOR as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteSector(initials: string, id: number) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteSector(initials, id).then(() => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.SECTOR as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }


    public static loadSector(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getSectors(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.SECTOR as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- SpecialField ---------------------- ----------------------------//
    public static saveKeySkill(initials: string, entity: SpecialField) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.saveSpecialField(initials, entity).then(value => {
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.SPECIAL_FIELD as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteKeySkill(initials: string, id: number) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteSpecialField(initials, id).then(() => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.SPECIAL_FIELD as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadKeySkill(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getSpecialFields(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.SPECIAL_FIELD as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Career ---------------------- ----------------------------//
    public static saveCareer(initials: string, entity: Career) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.saveCareer(initials, entity).then(value => {
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.CAREER as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteCareer(initials: string, id: number) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteCareer(initials, id).then(() => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.CAREER as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }


    public static loadCareer(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getCareers(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.CAREER as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Training ---------------------- ----------------------------//
    public static saveTraining(initials: string, entity: FurtherTraining) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.saveTraining(initials, entity).then(value => {
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.TRAINING as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteTraining(initials: string, id: number) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteTraining(initials, id).then(() => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.TRAINING as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }


    public static loadTraining(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getTrainings(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.TRAINING as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Education ---------------------- ----------------------------//
    public static saveEducation(initials: string, entity: Education) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.saveEducation(initials, entity).then(value => {
                    dispatch(entryUpdateAction(value, ProfileEntryTypeName.EDUCATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteEducation(initials: string, id: number) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteEducation(initials, id).then(() => {
                    dispatch(entryDeleteAction(id, ProfileEntryTypeName.EDUCATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadEducation(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getEducation(initials).then(value => {
                    dispatch(entryLoadAction(value, ProfileEntryTypeName.EDUCATION as keyof Profile & Array<ProfileEntry>));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Skill ---------------------- ----------------------------//
    /**
     * A new skill, or one changed in the dialog. Changes of an existing skill go to the server one after the other
     * (#320), like its rating.
     */
    public static saveProfileSkill(initials: string, entity: ProfileSkill) {
        return function (dispatch: redux.Dispatch) {
            const save = () => profileUpdateServiceClient.saveProfileSkill(initials, entity)
                .then(value => dispatch(skillUpdateAction(value)));
            if (entity.id) {
                saveInOrder(skillQueue(initials, entity.id), null, save);
            } else {
                save().catch(error => handleError(error));
            }
        };
    }

    /**
     * The rating, saved right away by a click on the stars: one change after the other per skill, and of several
     * clicks while one is being saved only the last is sent, so the server and the page end at the last click (#320).
     * The skill is taken from the state when its turn comes, so it carries what the change before saved.
     *
     * @param onSettled once this rating, or a later one that replaced it, is answered, successfully or not
     */
    public static saveProfileSkillRating(initials: string, skillId: number, rating: number, onSettled: () => void) {
        return function (dispatch: redux.Dispatch, getState: () => ApplicationState) {
            saveInOrder(skillQueue(initials, skillId), 'rating', () => {
                const skill = getState().profileStore.profile.skills.find(s => s.id === skillId);
                if (!skill || getState().profileStore.consultant.initials !== initials) {
                    // Deleted, or another profile opened, meanwhile
                    return Promise.resolve();
                }
                return profileUpdateServiceClient.saveProfileSkill(initials, {...skill, rating})
                    .then(value => dispatch(skillUpdateAction(value)));
            }, onSettled);
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteProfileSkill(initials: string, skill: ProfileSkill) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteProfileSkill(initials, skill.id)
                .then(() => dispatch(skillDeleteAction(skill.id)))
                .catch(error => handleError(error));
        };
    }

    public static loadProfileSkills(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.getSkills(initials).then(value => {
                    dispatch(skillLoadAction(value));
                }
            ).catch(error => handleError(error));
        };
    }

    // --------------------------- ---------------------- Projects ---------------------- ----------------------------//
    public static saveSelectedProject() {
        return function (dispatch: ThunkDispatch<any, any, any>, getState: () => ApplicationState) {
            const selectedProject = getState().profileStore.selectedProject;
            const initials = getState().profileStore.consultant.initials;
            profileUpdateServiceClient.saveProject(initials, selectedProject)
                .then(project => {
                    dispatch(projectUpdateSuccessAction(project));
                    dispatch(ProfileDataAsyncActionCreator.loadProfileSkills(initials));
                })
                .catch(error => handleError(error));
        };
    }

    @makeDeferrable(ActionType.AsyncDeleteEntry)
    public static deleteProject(initials: string, id: number) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient.deleteProject(initials, id).then(() => {
                    dispatch(projectDeleteAction(id));
                }
            ).catch(error => handleError(error));
        };
    }

    public static loadAllProjects(initials: string) {
        return function (dispatch: redux.Dispatch) {
            profileUpdateServiceClient
                .getProjects(initials)
                .then(value => dispatch(projectLoadAction(value)))
                .catch(error => handleError(error));
        };
    }
}
