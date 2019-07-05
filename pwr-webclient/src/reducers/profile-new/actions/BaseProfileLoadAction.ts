import {AbstractAction} from '../../profile/database-actions';
import {BaseProfile} from '../model/BaseProfile';
import {ActionType} from '../../ActionType';

export interface BaseProfileLoadAction extends AbstractAction {
    baseProfile: BaseProfile;
}


export function baseProfileLoadAction(baseProfile: BaseProfile): BaseProfileLoadAction {
    return {
        type: ActionType.LoadBaseProfileAction,
        baseProfile: baseProfile
    };
}