import {Dispatch, MiddlewareAPI} from 'redux';
import {ApplicationState} from '../reducerIndex';
import {ActionType} from '../ActionType';
import {deferDeleteEntry, deferEmptyTrash} from './DeferredActions';
import {selectedProjectHasChanged, selectIndexHasChanged} from '../../utils/PwrStoreUtils';
import {AbstractAction} from '../BaseActions';
import {confirmLeavingUnsavedChanges} from '../navigation/UnsavedChanges';

interface DeferrableAction<AppState> {
    type: ActionType;
    condition?: (state: AppState, action: any) => boolean;
    makeAction: (action: AbstractAction) => AbstractAction,
}

const unconditional = () => true;

/**
 * Actions that leave a project with unsaved changes; they wait for the UnsavedChangesDialog. Navigation is guarded
 * by PWR_HISTORY.block; "cancel" discards on purpose and saving and deleting need no question.
 */
const actionsLeavingUnsavedChanges: Array<{ type: ActionType, condition: (state: ApplicationState, action: any) => boolean }> = [
    {
        type: ActionType.SelectProject,
        condition: (state, action) => selectedProjectHasChanged(state.profileStore) && selectIndexHasChanged(state.profileStore, action.value)
    },
    {
        type: ActionType.AddNewProject,
        condition: (state) => selectedProjectHasChanged(state.profileStore)
    }
];

function selectedProjectId(state: ApplicationState, action: any): number | undefined {
    if (action.type !== ActionType.SelectProject || action.value < 0) {
        return undefined;
    }
    const project = state.profileStore.profile.projects[action.value];
    return project ? project.id : undefined;
}

/**
 * Discarding a new project removes it from the list, so the index of the project to select can shift
 */
function withProjectIndex(state: ApplicationState, action: any, projectId: number | undefined): any {
    if (projectId === undefined) {
        return action;
    }
    return {...action, value: state.profileStore.profile.projects.findIndex(project => project.id === projectId)};
}

const deferredActions: DeferrableAction<ApplicationState>[] = [
    {
        type: ActionType.AsyncDeleteEntry,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteVersion,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteTemplate,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteViewProfile,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteReport,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteSkillEverywhere,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteNameEntity,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteTreeCategory,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteConsultant,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteSkillAlias,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteNameEntityAlias,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteSkillLocale,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteCategoryLocale,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteNotificationEntry,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
    },
    {
        type: ActionType.AsyncDeleteTrashedNotifications,
        condition: unconditional,
        makeAction: action => deferEmptyTrash(action)
    }
];

export const deferredActionMiddleware = (api: MiddlewareAPI<Dispatch, ApplicationState>) => (next) => (action): any => {
    if (action.type === ActionType.ConfirmDeferredAction) {
        // Continue action and clear deferred state
        next(api.getState().deferred.deferredAction);
        next(action);
    } else if (actionsLeavingUnsavedChanges.some(value => value.type === action.type && value.condition(api.getState(), action))) {
        const projectId = selectedProjectId(api.getState(), action);
        api.dispatch(confirmLeavingUnsavedChanges(() => next(withProjectIndex(api.getState(), action, projectId))) as any);
    } else {
        let deferred = deferredActions.find(value => value.type === action.type);
        if (deferred && deferred.condition(api.getState(), action)) {
            next(deferred.makeAction(action));
        } else {
            return next(action);
        }
    }
};
