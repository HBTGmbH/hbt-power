import {emptyNavigationStore, NavigationStore} from '../../model/navigation/NavigationStore';
import {ActionType} from '../ActionType';
import {SetCurrentLocationAction, SetNavigationTargetAction} from './NavigationActionCreator';
import {AbstractAction} from '../BaseActions';


export class NavigationReducer {

    public static reduce(store = emptyNavigationStore(), action: AbstractAction): NavigationStore {
        switch (action.type) {
            case ActionType.SetCurrentLocation: {
                let act: SetCurrentLocationAction = action as SetCurrentLocationAction;
                return {
                    ...store,
                    currentLocation: act.currentLocation,
                    targetLocation: null,
                    confirmDialogOpen: false,
                }
            }
            case ActionType.SetNavigationTarget: {
                let act: SetNavigationTargetAction = action as SetNavigationTargetAction;
                return {
                    ...store,
                    targetLocation: act.target,
                    confirmDialogOpen: true,
                }
            }
            case ActionType.DropNavigationTarget: {
                return {
                    ...store,
                    targetLocation: null,
                    confirmDialogOpen: false,
                }
            }
        }
        return store;
    }
}
