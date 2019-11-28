import {AbstractAction} from '../BaseActions';
import {emptySkillVersionStore, SkillVersionStore} from './SkillVersionStore';
import {ActionType} from '../ActionType';
import {SkillVersionDeleteAction, SkillVersionsLoadAction} from './SkillVersionActions';

export function reduceSkillVersions(store: SkillVersionStore = emptySkillVersionStore, action: AbstractAction): SkillVersionStore {
    switch (action.type) {
        case ActionType.LoadVersionsForSkill: {
            const act = action as SkillVersionsLoadAction;
            store = {...store, ...{serviceSkillId: act.serviceSkillId}};
            return {...store, ...{currentVersions: act.versions}};
        }
        case ActionType.ClearVersions:
            return {...store, ...{currentVersions: []}};
        case ActionType.DeleteVersionFromSkill: {
            const act = action as SkillVersionDeleteAction;
            let versions = store.currentVersions;
            versions.filter(value => value != act.versionToDelete);
            return {...store, ...{currentVersions: versions}};
        }
    }
    return store;
}
