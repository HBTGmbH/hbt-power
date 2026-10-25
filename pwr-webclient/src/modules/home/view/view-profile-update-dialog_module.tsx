import * as React from 'react';
import {useDispatch} from 'react-redux';
import {Dialog} from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {PwrConfirmActions} from '../../general/pwr-form-actions';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

interface ViewProfileUpdateDialogProps {
    open: boolean;

    onClose(): void;

    viewProfileId: string;
}

/**
 * Asks before updating the view profile with the current data of the profile (#332): it changes in place, with its
 * name, note and settings, but entries the profile no longer has go
 */
export const ViewProfileUpdateDialog = (props: ViewProfileUpdateDialogProps) => {
    const dispatch = useDispatch();
    const update = () => {
        props.onClose();
        dispatch(ViewProfileActionCreator.AsyncUpdateViewProfile(props.viewProfileId) as any);
    };
    return <Dialog open={props.open} onClose={props.onClose} maxWidth={'sm'}>
        <DialogTitle>{PowerLocalize.get('ViewProfileUpdate.Title')}</DialogTitle>
        <DialogContent>
            <DialogContentText>{PowerLocalize.get('ViewProfileUpdate.Content')}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <PwrConfirmActions confirmText={PowerLocalize.get('ViewProfileUpdate.Update')} onConfirm={update}
                               onReject={props.onClose}/>
        </DialogActions>
    </Dialog>;
};
