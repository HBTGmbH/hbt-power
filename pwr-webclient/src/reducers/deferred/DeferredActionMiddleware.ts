import {MiddlewareAPI} from 'redux';
import {ApplicationState} from '../reducerIndex';
import {ActionType} from '../ActionType';
import {ProfileStore} from '../profile-new/ProfileStore';
import {areEqualArrays, areEqualByName, areEqualSkillsByName} from '../../utils/PwrEqualUtils';
import {deferAction} from './DeferredActions';

interface DeferrableAction<AppState> {
    type: ActionType;
    condition?: (state: AppState, action: any) => boolean;
}

function selectIndexHasChanged(state: ProfileStore, index: number) {
    return state.selectedProjectIndex !== index;
}

function selectedProjectHasChanged(state: ProfileStore): boolean {
    const project = state.profile.projects[state.selectedProjectIndex];
    const editingProject = state.selectedProject;
    if (!editingProject || !project) {
        return false;
    }
    return project.id == null
        || project.name !== editingProject.name
        || project.startDate !== editingProject.startDate
        || project.endDate !== editingProject.endDate
        || project.description !== editingProject.description
        || !areEqualByName(project.client, editingProject.client)
        || !areEqualByName(project.broker, editingProject.broker)
        || !areEqualArrays(project.projectRoles, editingProject.projectRoles, areEqualByName)
        || !areEqualArrays(project.skills, editingProject.skills, areEqualSkillsByName);

}

const deferredActions: DeferrableAction<ApplicationState>[] = [
    {
        type: ActionType.SelectProject,
        condition: (state, action) => selectedProjectHasChanged(state.profileStore)  && selectIndexHasChanged(state.profileStore, action.value)
    },
    {
        type: ActionType.CancelEditSelectedProject,
        condition: (state) => selectedProjectHasChanged(state.profileStore)
    }
];

export const deferredActionMiddleware = (api: MiddlewareAPI<ApplicationState>) => (next) => (action): any => {
    if (action.type === ActionType.ConfirmDeferredAction) {
        // Continue action and clear deferred state
        next(api.getState().deferred.deferredAction);
        next(action);
    } else {
        let deferred = deferredActions.find(value => value.type === action.type);
        if (deferred && deferred.condition(api.getState(), action)) {
            next(deferAction(action));
        } else {
            return next(action);
        }
    }
};
