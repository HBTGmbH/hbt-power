import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {matchPath, useHistory, useLocation, useParams} from 'react-router-dom';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileStore} from '../../../../../reducers/profile-new/ProfileStore';
import {Paths} from '../../../../../Paths';
import {
    addNewProject,
    selectProject
} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';

/**
 * URL of the projects tab for the selected project. There is no read mode (#338), so no URL for an edit mode either.
 */
export function projectsUrl(initials: string, store: ProfileStore): string {
    const project = store.selectedProject;
    if (!project) {
        return Paths.build(Paths.USER_PROFILE_PROJECTS, {initials});
    }
    if (project.id === null) {
        return Paths.build(Paths.USER_PROFILE_NEW_PROJECT, {initials});
    }
    // Slug from the saved name: it does not follow the typing
    const saved = (store.profile.projects || []).find(other => other.id === project.id);
    return Paths.build(Paths.USER_PROFILE_PROJECT, {initials, projectId: String(project.id), slug: Paths.projectSlug(saved && saved.name)});
}

interface UrlTarget {
    isNew: boolean;
    projectId: number | null;
}

function parseTarget(pathname: string): UrlTarget {
    if (matchPath(pathname, {path: Paths.USER_PROFILE_NEW_PROJECT, exact: true})) {
        return {isNew: true, projectId: null};
    }
    // Old links of the edit mode (…/edit, before #338) lead to the project
    const edit = matchPath<{ projectId: string }>(pathname, {path: Paths.USER_PROFILE_PROJECT_EDIT, exact: true});
    const view = matchPath<{ projectId: string }>(pathname, {path: Paths.USER_PROFILE_PROJECT, exact: true});
    const match = edit || view;
    const projectId = match ? Number(match.params.projectId) : NaN;
    return {isNew: false, projectId: isNaN(projectId) ? null : projectId};
}

/**
 * Both URLs show the same project: the slug is not evaluated, a stale or missing one leads to the same project, and
 * an old link with /edit too
 */
function sameProject(pathname: string, other: string): boolean {
    const a = parseTarget(pathname);
    const b = parseTarget(other);
    return a.projectId !== null && a.projectId === b.projectId;
}

/**
 * Keeps the URL of the projects tab and the project selection in the store in sync, in both directions:
 * - Selecting, saving, discarding or adding a project changes the store, the URL follows.
 * - Reload, back/forward and links change the URL, the store follows through the same actions, so the
 *   confirmation for unsaved changes (UnsavedChangesDialog) applies. If it is rejected, the URL is reset.
 */
export const ProjectUrlSync = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const {initials} = useParams<{ initials: string }>();
    const store = useSelector((state: ApplicationState) => state.profileStore);
    // A question is open (delete confirmation or unsaved changes): wait for the answer
    const deferredPending = useSelector((state: ApplicationState) =>
        !!state.deferred.deferredAction || state.navigationSlice.confirmDialogOpen);

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

        if (path === storeUrl || sameProject(path, storeUrl)) {
            target.current = null;
            attemptedAt.current = null;
            if (path !== storeUrl) {
                // Only the slug differs (old link, renamed project): write the right one
                history.replace(storeUrl);
            }
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
            }
        }
        attemptedAt.current = storeUrl;
    }, [location.pathname, storeUrl, store, deferredPending, dispatch, history, initials]);

    return null;
};
