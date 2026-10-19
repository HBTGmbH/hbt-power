import {emptyNavigationStore, NavigationStore} from '../../model/navigation/NavigationStore';
import {ActionType} from '../ActionType';
import {SetCurrentLocationAction} from './NavigationActionCreator';
import {AbstractAction} from '../BaseActions';


export class NavigationReducer {

    public static reduce(store = emptyNavigationStore(), action: AbstractAction): NavigationStore {
        switch (action.type) {
            case ActionType.SetCurrentLocation: {
                let act: SetCurrentLocationAction = action as SetCurrentLocationAction;
                return {
                    ...store,
                    currentLocation: act.currentLocation,
                }
            }
            case ActionType.OpenUnsavedChangesDialog: {
                return {
                    ...store,
                    confirmDialogOpen: true,
                }
            }
            case ActionType.CloseUnsavedChangesDialog: {
                return {
                    ...store,
                    confirmDialogOpen: false,
                }
            }
        }
        return store;
    }
}
