import {MetaDataStore} from '../../model/metadata/MetaDataStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {AddOrReplaceBuildInfoAction, AddOrReplaceClientInfoAction} from './MetaDataActions';
import {ClientBuildInfo} from '../../model/metadata/ClientBuildInfo';

export namespace MetaDataReducer {

    export function reduce(store: MetaDataStore, action: AbstractAction): MetaDataStore {
        if (isNullOrUndefined(store)) {
            let empty = MetaDataStore.empty();
            console.info('Initializing MetaDataStore', empty);
            return empty;
        }
        switch (action.type) {
            case ActionType.AddOrReplaceBuildInfo: {
                let act: AddOrReplaceBuildInfoAction = action as AddOrReplaceBuildInfoAction;
                return store.buildInfoByService(store.buildInfoByService().set(act.service, act.buildInfo));
            }
            case ActionType.AddOrReplaceClientInfo: {
                let act: AddOrReplaceClientInfoAction = action as AddOrReplaceClientInfoAction;
                return store.clientBuildInfo(ClientBuildInfo.of(act.info));
            }
        }
        return store;
    }

}