import {ActionType} from '../ActionType';
import {
    ChangeLoginStatusAction,
    ChangeRequestStatusAction, LoadConsultantInfoSuccess,
    ReceiveAllConsultantsAction,
    ReceiveConsultantAction
} from './admin-actions';
import {RequestStatus} from '../../Store';
import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {Paths} from '../../Paths';
import {SkillActionCreator} from '../skill/SkillActionCreator';
import {NavigationActionCreator} from '../navigation/NavigationActionCreator';
import {confirmLeavingUnsavedChanges} from '../navigation/UnsavedChanges';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';
import {PowerApiError} from '../../clients/PowerHttpClient';
import {Alerts} from '../../utils/Alerts';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {SuggestionAsyncActionCreator} from '../suggestions/SuggestionAsyncActionCreator';
import {AbstractAction, ChangeBoolValueAction, ChangeNumberValueAction} from '../BaseActions';
import {makeDeferrable} from '../deferred/AsyncActionUnWrapper';
import {confirmDeleteByName} from '../deferred/DeferredActions';
import {ThunkDispatch} from 'redux-thunk';
import {resetProfileStore} from '../profile-new/profile/actions/ProfileActions';
import {loadConsultantNames} from '../consultant-names/ConsultantNameActionCreator';
import {NameEntity} from '../profile-new/profile/model/NameEntity';
import {NameEntityLocalization} from '../../model/NameEntityLocalization';
import {ConsultantInfoDTO} from '../../model/ConsultantInfoDTO';

const profileServiceClient = ProfileServiceClient.instance();

/**
 * After a profile element changed in all profiles (#227): the lists of all elements and who uses them are loaded again
 */
function afterNameEntityChange(dispatch: ThunkDispatch<any, any, any>) {
    dispatch(SuggestionAsyncActionCreator.requestAllNameEntities());
    dispatch(StatisticsActionCreator.ForgetNameEntityUsageInfo());
}

/**
 * After a skill changed in the tree and in all profiles (#228, #229): the tree, the used skills and who uses them
 */
function afterSkillChange(dispatch: ThunkDispatch<any, any, any>, ...skillNames: Array<string>) {
    dispatch(SkillActionCreator.AsyncLoadTree());
    dispatch(SuggestionAsyncActionCreator.requestAllSkills());
    dispatch(StatisticsActionCreator.ForgetSkillUsageInfo(...skillNames));
}

export class AdminActionCreator {

    public static ChangeRequestStatus(to: RequestStatus): ChangeRequestStatusAction {
        return {
            type: ActionType.AdminRequestStatus,
            requestStatus: to
        };
    }

    public static ChangeLoginStatus(status: LoginStatus): ChangeLoginStatusAction {
        return {
            type: ActionType.ChangeAdminLoginStatus,
            status: status
        };
    }

    public static LogInAdmin(): AbstractAction {
        return {
            type: ActionType.LogInAdmin
        };
    }

    public static LogOutAdmin(): AbstractAction {
        return {
            type: ActionType.LogOutAdmin
        };
    }

    public static ReceiveAllConsultants(consultants: Array<ConsultantInfo>): ReceiveAllConsultantsAction {
        return {
            type: ActionType.ReceiveAllConsultants,
            consultants: consultants
        };
    }

    public static ReceiveConsultant(consultant: ConsultantInfo): ReceiveConsultantAction {
        return {
            type: ActionType.ReceiveSingleConsultant,
            consultant: consultant
        };
    }

    public static AsyncNavigateToStatistics() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            dispatch(StatisticsActionCreator.AsyncRequestSkillUsages());
            dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.ADMIN_STATISTICS_SKILL));
        };
    }

    public static SetFilterNonCustomSkills(doFilter: boolean): ChangeBoolValueAction {
        return {
            type: ActionType.SetCustomSkillFiltering,
            value: doFilter
        };
    }

    public static SetReportUploadPending(pending: boolean): ChangeBoolValueAction {
        return {
            type: ActionType.SetReportUploadPending,
            value: pending
        };
    }

    public static SetReportUploadProgress(progress: number): ChangeNumberValueAction {
        return {
            type: ActionType.SetReportUploadProgress,
            value: progress
        };
    }


    public static AsyncNavigateToAdmin() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            // Resetting the profile would drop unsaved changes in a project: ask before anything happens
            dispatch(confirmLeavingUnsavedChanges(() => {
                dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.ADMIN_CONSULTANTS));
                dispatch(resetProfileStore());
            }));
        };
    }

    public static AsyncValidateAuthentication() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.authenticateAdmin().then(ignored => {
                dispatch(AdminActionCreator.LogInAdmin());
                dispatch(AdminActionCreator.AsyncLoadConsultantInfo());
            }).catch((error: PowerApiError) => {
                console.error(error);
                if (error.status !== -1) {
                    dispatch(AdminActionCreator.ChangeLoginStatus(LoginStatus.REJECTED));
                } else {
                    dispatch(AdminActionCreator.ChangeLoginStatus(LoginStatus.UNAVAILABLE));
                }
            });
        };
    }

    public static AsyncGetAllConsultants() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.getConsultants()
                .then(apiConsultants => apiConsultants.map((value) => ConsultantInfo.fromAPI(value)))
                .then(consultants => dispatch(AdminActionCreator.ReceiveAllConsultants(consultants)))
                .catch(console.error);
        };
    }

    public static AsyncRedirectToUser(initials: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.USER_PROFILE.replace(":initials", initials)));
        };
    }

    /**
     * The overview of a consultant (#211): profile check and view profiles
     */
    public static AsyncRedirectToUserHome(initials: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.build(Paths.USER_HOME, {initials})));
        };
    }

    public static AsyncLoadConsultant(initials: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.getConsultant(initials)
                .then(res => dispatch(AdminActionCreator.ReceiveConsultant(ConsultantInfo.fromAPI(res))))
                .catch(console.error);
        };
    }

    public static AsyncCreateConsultant(consultantInfo: ConsultantInfo) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            let apiConsultant = consultantInfo.toAPI();
            profileServiceClient.createConsultant(apiConsultant)
                .then(_ => dispatch(AdminActionCreator.AsyncLoadConsultant(consultantInfo.initials())))
                // A new first name can change the short names of others (#216)
                .then(() => dispatch(loadConsultantNames()))
                .then(() => Alerts.showSuccess('Created consultant ' + consultantInfo.initials()))
                .catch(console.error);
        };
    }

    public static AsyncUpdateConsultant(consultantInfo: ConsultantInfo) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            let apiConsultant = consultantInfo.toAPI();
            profileServiceClient.updateConsultant(apiConsultant)
                .then(consultant => dispatch(AdminActionCreator.ReceiveConsultant(ConsultantInfo.fromAPI(consultant))))
                .then(() => dispatch(loadConsultantNames()))
                .then(_ => Alerts.showSuccess('Consultant ' + apiConsultant.initials + ' updated!'))
                .catch(console.error);
        };
    }

    /**
     * Merges skill source into skill target: in all profiles and projects, and in the skill tree, where source becomes
     * an alias of target. Expected rejections of the merge (400, 404, 409) are explained to the admin. The profile
     * service has refreshed the statistics when the merge returns, so who uses source and target is loaded again (#205).
     */
    /** The profiles get <code>targetName</code>, the name of the target in the skill tree (#207) */
    public static AsyncMergeSkill(source: string, target: string, version?: string, targetName: string = target) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.mergeSkill(source, target, version)
                .then(() => {
                    dispatch(SuggestionAsyncActionCreator.requestAllSkills());
                    dispatch(StatisticsActionCreator.ForgetSkillUsageInfo(source, target, targetName));
                    dispatch(StatisticsActionCreator.AsyncRequestSkillUsageInfo(targetName));
                    // The source is gone from the skill tree, or an alias of the target now (#228, #229)
                    dispatch(SkillActionCreator.AsyncLoadTree());
                })
                .then(() => Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.Success', source, targetName)))
                .catch((error: PowerApiError) => {
                    const key = {
                        400: 'AdminClient.Infos.UsedSkills.Merge.Error.Invalid',
                        404: 'AdminClient.Infos.UsedSkills.Merge.Error.TargetNotFound',
                        409: 'AdminClient.Infos.UsedSkills.Merge.Error.Conflict'
                    }[error.status];
                    if (key) {
                        Alerts.showError(PowerLocalize.getFormatted(key, source, target, error.message));
                    } else {
                        console.error(error);
                    }
                });
        };
    }

    /**
     * Renames a skill of the skill tree, in the tree and in all profiles (#228); the old name becomes an alias. Who
     * uses the skill is loaded again under its new name.
     */
    public static AsyncRenameSkill(name: string, newName: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.renameSkill(name, newName.trim())
                .then(() => afterSkillChange(dispatch, name, newName.trim()))
                .then(() => Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Rename.Success', name, newName.trim())))
                .catch(console.error);
        };
    }

    /**
     * Deletes a skill from all profiles and projects and from the skill tree (#229). Used by profiles, the name has to
     * be entered twice (#181); unused, a simple question.
     */
    @makeDeferrable(ActionType.AsyncDeleteSkillEverywhere, (name: string, profileCount: number) =>
        profileCount > 0 ? confirmDeleteByName('SkillEverywhere', name, profileCount) : confirmDeleteByName('Skill', name))
    public static AsyncDeleteSkillEverywhere(name: string, profileCount: number) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.deleteSkillEverywhere(name)
                .then(() => afterSkillChange(dispatch, name))
                .then(() => Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.Info.SkillTree.Delete.Success', name)))
                .catch(console.error);
        };
    }

    /** onDone gets the renamed element (the middleware doesn't pass on the promise of a thunk) */
    public static AsyncRenameNameEntity(nameEntity: NameEntity, name: string, onDone: (renamed: NameEntity) => void) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.renameNameEntity(nameEntity.id, name.trim())
                .then(renamed => {
                    afterNameEntityChange(dispatch);
                    Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.NameEntity.Rename.Success', nameEntity.name, renamed.name));
                    onDone(renamed);
                })
                .catch(console.error);
        };
    }

    /** onDone gets the target, which is left */
    public static AsyncMergeNameEntity(source: NameEntity, target: NameEntity, onDone: (merged: NameEntity) => void) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.mergeNameEntity(source.id, target.id)
                .then(merged => {
                    afterNameEntityChange(dispatch);
                    Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.NameEntity.Merge.Success', source.name, target.name));
                    onDone(merged);
                })
                .catch(console.error);
        };
    }

    /**
     * Deletes a profile element from all profiles (#227). Used by profiles, the dialog names them and the name has to
     * be entered twice (#181); unused, a simple question.
     */
    @makeDeferrable(ActionType.AsyncDeleteNameEntity, (nameEntity: NameEntity, users: Array<string>) =>
        users.length > 0 ? confirmDeleteByName('NameEntity', nameEntity.name, users.length, users.join(', '))
            : {...confirmDeleteByName('NameEntityUnused', nameEntity.name), name: ''})
    public static AsyncDeleteNameEntity(nameEntity: NameEntity, users: Array<string>) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.deleteNameEntity(nameEntity.id)
                .then(() => {
                    afterNameEntityChange(dispatch);
                    Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.NameEntity.Delete.Success', nameEntity.name));
                })
                .catch(console.error);
        };
    }

    /**
     * Adds another name to a profile element (#270): a consultant typing it gets the element. A conflict (the name or
     * an alias of another element of the type) is explained to the admin, other errors are already shown by the client.
     */
    public static AsyncAddNameEntityAlias(nameEntity: NameEntity, alias: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.addNameEntityAlias(nameEntity.id, alias.trim())
                .then(() => dispatch(SuggestionAsyncActionCreator.requestAliases()))
                .catch((error: PowerApiError) => {
                    if (error.status === 409) {
                        Alerts.showError(PowerLocalize.getFormatted('AdminClient.NameEntity.Alias.Conflict', alias.trim()));
                    } else if (error.status === 400) {
                        Alerts.showError(PowerLocalize.get('AdminClient.Info.SkillTree.Alias.Invalid'));
                    }
                });
        };
    }

    /** The alias has to be entered twice (#181); entries saved under it keep the element */
    @makeDeferrable(ActionType.AsyncDeleteNameEntityAlias,
        (nameEntity: NameEntity, alias: string) => confirmDeleteByName('NameEntityAlias', alias, nameEntity.name))
    public static AsyncDeleteNameEntityAlias(nameEntity: NameEntity, alias: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.deleteNameEntityAlias(nameEntity.id, alias)
                .then(() => dispatch(SuggestionAsyncActionCreator.requestAliases()))
                .catch(console.error);
        };
    }

    /** Sets the name of the element in a language (#291); onDone gets the localizations afterwards */
    public static AsyncSetNameEntityLocalization(nameEntity: NameEntity, language: string, qualifier: string,
                                                 onDone: (localizations: Array<NameEntityLocalization>) => void) {
        return function () {
            profileServiceClient.setNameEntityLocalization(nameEntity.id, language, qualifier.trim())
                .then(onDone)
                .catch(console.error);
        };
    }

    /** The translation has to be entered twice (#181); onDone gets the localizations afterwards */
    @makeDeferrable(ActionType.AsyncDeleteNameEntityLocalization,
        (nameEntity: NameEntity, language: string, translation: string) =>
            confirmDeleteByName('Locale', translation, nameEntity.name))
    public static AsyncDeleteNameEntityLocalization(nameEntity: NameEntity, language: string, translation: string,
                                                    onDone: (localizations: Array<NameEntityLocalization>) => void) {
        return function () {
            profileServiceClient.deleteNameEntityLocalization(nameEntity.id, language)
                .then(onDone)
                .catch(console.error);
        };
    }

    /** The dialog with the list of unused elements is the question; onDone after deleting, e.g. to check again */
    public static AsyncDeleteUnusedNameEntities(type: string, onDone?: () => void) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.deleteUnusedNameEntities(type)
                .then(deleted => {
                    afterNameEntityChange(dispatch);
                    Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.NameEntity.Unused.Success', deleted.length));
                    if (onDone) {
                        onDone();
                    }
                })
                .catch(console.error);
        };
    }

    /**
     * The initials have to be entered twice (#181); everything about the consultant goes with it (#240), so who uses
     * a skill or profile element is loaded again
     */
    @makeDeferrable(ActionType.AsyncDeleteConsultant,
        (initials: string, fullName: string) => confirmDeleteByName('Consultant', initials, fullName))
    public static AsyncDeleteConsultant(initials: string, fullName: string) {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.deleteConsultant(initials)
                .then(() => dispatch(AdminActionCreator.AsyncGetAllConsultants()))
                .then(() => dispatch(loadConsultantNames()))
                .then(() => dispatch(StatisticsActionCreator.ForgetAllUsageInfo()))
                .then(() => Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.Consultant.Delete.Success', fullName, initials)))
                .catch(console.error);
        };
    }

    public static LoadConsultantInfoSuccess(consultantInfo: ConsultantInfoDTO[]): LoadConsultantInfoSuccess {
        return {
            type: ActionType.LoadConsultantInfoSuccess,
            consultantInfo: consultantInfo
        };
    }

    public static AsyncLoadConsultantInfo() {
        return function (dispatch: ThunkDispatch<any, any, any>) {
            profileServiceClient.getAllConsultantInfos()
              .then((consultantInfo) => dispatch(AdminActionCreator.LoadConsultantInfoSuccess(consultantInfo)))
              .catch(console.error);
        };
    }
}
