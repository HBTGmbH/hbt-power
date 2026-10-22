import {SkillServiceClient} from '../../clients/SkillServiceClient';
import * as redux from 'redux';
import {newSkillVersionDeleteAction, newSkillVersionsLoadAction} from './SkillInfoActions';
import {makeDeferrable} from '../deferred/AsyncActionUnWrapper';
import {confirmDeleteByName} from '../deferred/DeferredActions';
import {ActionType} from '../ActionType';

const skillServiceClient = SkillServiceClient.instance();

export class SkillVersionActionCreator {


    public static AsyncGetSkillVersions(skillName: string) {
        return function (dispatch: redux.Dispatch) {
            skillServiceClient.getSkillByName(skillName)
                .then(skill => dispatch(newSkillVersionsLoadAction(skill.versions, skill.id)))
                .catch(console.error);
        };
    }

    public static AsyncAddSkillVersion(skillId: number, newVersion: string) {
        return function (dispatch: redux.Dispatch) {
            skillServiceClient.addVersion(skillId, newVersion)
                .then(versions => dispatch(newSkillVersionsLoadAction(versions, skillId)))
                .catch(console.error);
        };
    }

    /** Only in the admin skill tree: the version has to be entered twice (#181) */
    @makeDeferrable(ActionType.AsyncDeleteVersion, (skillId: number, versionToDelete: string, skillName: string) =>
        confirmDeleteByName('Version', versionToDelete, skillName))
    public static AsyncDeleteSkillVersion(skillId: number, versionToDelete: string, skillName: string) {
        return function (dispatch: redux.Dispatch) {
            skillServiceClient.deleteVersion(skillId, versionToDelete)
                .then(() => dispatch(newSkillVersionDeleteAction(versionToDelete)))
                .catch(console.error);
        };
    }
}
