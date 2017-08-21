import {MetaDataStore} from '../../model/metadata/MetaDataStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {AddOrReplaceBuildInfoAction} from './MetaDataActions';
export namespace MetaDataReducer {

    export function reduce(store: MetaDataStore, action: AbstractAction): MetaDataStore {
        if(isNullOrUndefined(store)) {
            let empty = MetaDataStore.empty();
            console.info("Initializing MetaDataStore", empty);
            return empty;
        }
        switch(action.type) {
            case ActionType.AddOrReplaceBuildInfo: {
                let act: AddOrReplaceBuildInfoAction = action as AddOrReplaceBuildInfoAction;
                return store.buildInfoByService(store.buildInfoByService().set(act.service, act.buildInfo));
            }
        }
        return store;
    }

}