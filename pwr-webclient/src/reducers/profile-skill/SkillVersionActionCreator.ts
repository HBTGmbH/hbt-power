import {SkillServiceClient} from '../../clients/SkillServiceClient';
import * as redux from 'redux';
import {newSkillVersionDeleteAction, newSkillVersionsLoadAction} from './SkillInfoActions';
import {makeDeferrable} from '../deferred/AsyncActionUnWrapper';
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

    @makeDeferrable(ActionType.AsyncDeleteVersion)
    public static AsyncDeleteSkillVersion(skillId: number, versionToDelete: string) {
        return function (dispatch: redux.Dispatch) {
            skillServiceClient.deleteVersion(skillId, versionToDelete)
                .then(() => dispatch(newSkillVersionDeleteAction(versionToDelete)))
                .catch(console.error);
        };
    }
}
