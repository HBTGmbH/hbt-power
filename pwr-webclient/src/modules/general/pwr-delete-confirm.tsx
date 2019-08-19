import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import Slide from '@material-ui/core/Slide/Slide';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import {isNullOrUndefined} from 'util';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

export interface PwrDeleteConfirmProps {
    open: boolean;

    onClose(): void;

    onConfirm(): void;

    infoText?: string;
    header?: string;
}

export class PwrDeleteConfirm extends React.Component<PwrDeleteConfirmProps> {

    private confirmAndClose = () => {
        this.props.onConfirm();
        this.props.onClose();
    };

    private handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // its important we surpress the enter key leaving this dialog.
        // That would trigger a "add" action in the opening dialog
        if (event.key === 'Enter') {
            this.confirmAndClose();
            event.stopPropagation();
        }
        else if (event.key === 'Escape') {
            this.close();
            event.stopPropagation();
        }
    };

    private close = () => {
        this.props.onClose();
    };

    render() {
        return <Dialog
            open={this.props.open}
            onClose={this.props.onClose}
            onKeyDown={event => this.handleKeyDown(event)}
            TransitionComponent={Transition}
        >
            <DialogTitle>
                {isNullOrUndefined( this.props.header)? 'Löschen bestätigen' : this.props.header}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {isNullOrUndefined( this.props.infoText ) ? 'Willst du das Element löschen?' : this.props.infoText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={this.confirmAndClose} autoFocus>
                    {PowerLocalize.get('Action.Yes')}
                </Button>
                <Button color="primary" onClick={this.close}>
                    {PowerLocalize.get('Action.No')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}
