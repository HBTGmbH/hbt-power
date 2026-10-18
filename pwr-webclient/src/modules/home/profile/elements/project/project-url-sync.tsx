import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {matchPath, useHistory, useLocation, useParams} from 'react-router-dom';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileStore} from '../../../../../reducers/profile-new/ProfileStore';
import {Paths} from '../../../../../Paths';
import {
    addNewProject,
    cancelEditSelectedProjectAction,
    editSelectedProjectAction,
    selectProject
} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';

/**
 * URL of the projects tab for the selected project and its edit mode.
 */
export function projectsUrl(initials: string, store: ProfileStore): string {
    const project = store.selectedProject;
    if (!project) {
        return Paths.build(Paths.USER_PROFILE_PROJECTS, {initials});
    }
    if (project.id === null) {
        return Paths.build(Paths.USER_PROFILE_NEW_PROJECT, {initials});
    }
    const path = store.isProjectEditing ? Paths.USER_PROFILE_PROJECT_EDIT : Paths.USER_PROFILE_PROJECT;
    return Paths.build(path, {initials, projectId: String(project.id)});
}

interface UrlTarget {
    isNew: boolean;
    projectId: number | null;
    edit: boolean;
}

function parseTarget(pathname: string): UrlTarget {
    if (matchPath(pathname, {path: Paths.USER_PROFILE_NEW_PROJECT, exact: true})) {
        return {isNew: true, projectId: null, edit: true};
    }
    const edit = matchPath<{ projectId: string }>(pathname, {path: Paths.USER_PROFILE_PROJECT_EDIT, exact: true});
    const view = matchPath<{ projectId: string }>(pathname, {path: Paths.USER_PROFILE_PROJECT, exact: true});
    const match = edit || view;
    const projectId = match ? Number(match.params.projectId) : NaN;
    return {isNew: false, projectId: isNaN(projectId) ? null : projectId, edit: !!edit};
}

/**
 * Keeps the URL of the projects tab and the project selection in the store in sync, in both directions:
 * - Selecting, editing, saving, cancelling or adding a project changes the store, the URL follows.
 * - Reload, back/forward and links change the URL, the store follows through the same actions, so the
 *   confirmation for unsaved changes (DeferredActionMiddleware) applies. If it is rejected, the URL is reset.
 */
export const ProjectUrlSync = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const {initials} = useParams<{ initials: string }>();
    const store = useSelector((state: ApplicationState) => state.profileStore);
    const deferredPending = useSelector((state: ApplicationState) => !!state.deferred.deferredAction);

    const storeUrl = projectsUrl(initials, store);
    const previousStoreUrl = useRef<string | null>(null);
    const previousPath = useRef<string | null>(null);
    // URL that still has to be applied to the store, and the store URL when the last action for it was dispatched
    const target = useRef<string | null>(null);
    const attemptedAt = useRef<string | null>(null);

    useEffect(() => {
        if (deferredPending) {
            return;
        }
        const path = location.pathname;
        const pathChanged = previousPath.current !== path;
        const storeChanged = previousStoreUrl.current !== null && previousStoreUrl.current !== storeUrl;
        previousPath.current = path;
        previousStoreUrl.current = storeUrl;

        if (path === storeUrl) {
            target.current = null;
            attemptedAt.current = null;
            return;
        }
        if (storeChanged && !pathChanged && target.current === null) {
            history.push(storeUrl);
            return;
        }
        if (pathChanged) {
            target.current = path;
            attemptedAt.current = null;
        }
        if (target.current === null) {
            return;
        }
        if (attemptedAt.current === storeUrl) {
            // The last action did not change the store, e.g. the confirmation was rejected: show the store state again
            target.current = null;
            attemptedAt.current = null;
            history.replace(storeUrl);
            return;
        }

        if (!store.profile.id) {
            // Wait for the profile: projects loaded later would replace a project added or selected now
            return;
        }
        const wanted = parseTarget(target.current);
        const projects = store.profile.projects || [];
        const selected = store.selectedProject;
        if (wanted.isNew) {
            if (selected && selected.id !== null) {
                dispatch(selectProject(-1));
            } else {
                dispatch(addNewProject());
            }
        } else if (wanted.projectId === null) {
            dispatch(selectProject(-1));
        } else {
            const index = projects.findIndex(project => project.id === wanted.projectId);
            if (index < 0) {
                // Unknown project: show the list without selection
                target.current = null;
                history.replace(Paths.build(Paths.USER_PROFILE_PROJECTS, {initials}));
                return;
            }
            if (!selected || selected.id !== wanted.projectId) {
                // A stale index (e.g. after switching the consultant) would be ignored by the reducer, deselect first
                dispatch(selectProject(index === store.selectedProjectIndex ? -1 : index));
            } else if (wanted.edit && !store.isProjectEditing) {
                dispatch(editSelectedProjectAction());
            } else if (!wanted.edit && store.isProjectEditing) {
                dispatch(cancelEditSelectedProjectAction());
            }
        }
        attemptedAt.current = storeUrl;
    }, [location.pathname, storeUrl, store, deferredPending, dispatch, history, initials]);

    return null;
};
