import * as React from 'react';
import {useSelector} from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import LockOutlined from '@material-ui/icons/LockOutlined';
import {useTheme} from '@material-ui/core/styles';
import {ApplicationState} from '../../reducers/reducerIndex';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {PwrConfirmActions} from '../general/pwr-form-actions';
import {OIDCService} from '../../OIDCService';

/**
 * Offers a new login when it expired while working (#323): the requests that need it wait, the page stays as it is.
 * Erneut anmelden opens the popup of Microsoft right in the click, the only moment browsers allow it; afterwards the
 * requests go on. Only the buttons close the dialog, a click next to it or Escape would cancel the action unasked.
 */
export const SessionExpiredDialog = () => {
    const theme = useTheme();
    const open = useSelector((state: ApplicationState) => state.crossCutting.sessionExpiredDialogOpen);
    const login = () => OIDCService.instance().loginInPopup();
    const cancel = () => OIDCService.instance().cancelLoginInPopup();

    return <Dialog open={open} maxWidth={'sm'} aria-labelledby="session-expired-title">
        <DialogTitle id="session-expired-title">
            <span style={{display: 'flex', alignItems: 'center'}}>
                <LockOutlined style={{color: theme.palette.warning.main, marginRight: '12px'}}/>
                {PowerLocalize.get('SessionExpired.Title')}
            </span>
        </DialogTitle>
        <DialogContent>
            <DialogContentText>{PowerLocalize.get('SessionExpired.Content')}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <PwrConfirmActions confirmText={PowerLocalize.get('SessionExpired.Action.Login')} onConfirm={login}
                               onReject={cancel} autoFocus="confirm"/>
        </DialogActions>
    </Dialog>;
};
