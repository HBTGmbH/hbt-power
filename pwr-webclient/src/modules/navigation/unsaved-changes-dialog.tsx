import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import Warning from '@material-ui/icons/Warning';
import {ApplicationState} from '../../reducers/reducerIndex';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {PwrConfirmActions} from '../general/pwr-form-actions';
import {useTheme} from '@material-ui/core/styles';
import {discardUnsavedChanges, keepUnsavedChanges} from '../../reducers/navigation/UnsavedChanges';

/**
 * The saved title, by which the project is known (the edited one for a new project); null for a new project without
 * a title
 */
function projectName(state: ApplicationState): string | null {
    const project = state.profileStore.selectedProject;
    if (!project) {
        return null;
    }
    const saved = state.profileStore.profile.projects.find(entry => entry.id !== null && entry.id === project.id);
    return (saved && saved.name) || project.name || null;
}

/**
 * Asks before unsaved changes in a project are lost (see confirmLeavingUnsavedChanges). Keeping is the default:
 * it has the focus, and Enter, Escape and a click next to the dialog keep the changes.
 */
export const UnsavedChangesDialog = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const open = useSelector((state: ApplicationState) => state.navigationSlice.confirmDialogOpen);
    const name = useSelector(projectName);
    const keep = () => dispatch(keepUnsavedChanges());
    const discard = () => dispatch(discardUnsavedChanges());
    const content = name
        ? PowerLocalize.getFormatted('UnsavedChanges.Content', name)
        : PowerLocalize.get('UnsavedChanges.Content.NewProject');

    return <Dialog open={open} onClose={keep} maxWidth={'sm'} aria-labelledby="unsaved-changes-title">
        <DialogTitle id="unsaved-changes-title">
            <span style={{display: 'flex', alignItems: 'center'}}>
                <Warning style={{color: theme.palette.warning.main, marginRight: '12px'}}/>
                {PowerLocalize.get('UnsavedChanges.Title')}
            </span>
        </DialogTitle>
        <DialogContent>
            <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
            {/* Discarding confirms the question and destroys the changes; keeping stays the default with the focus */}
            <PwrConfirmActions destructive confirmText={PowerLocalize.get('UnsavedChanges.Action.Discard')} onConfirm={discard}
                               rejectText={PowerLocalize.get('UnsavedChanges.Action.KeepEditing')} onReject={keep}
                               autoFocus="reject"/>
        </DialogActions>
    </Dialog>;
};
