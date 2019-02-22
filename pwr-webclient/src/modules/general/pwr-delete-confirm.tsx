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
        console.log("confirmAndClose",this.props.onClose());
        this.props.onConfirm();
        this.props.onClose();
    };

    private close = () => {
        console.log("close");
        this.props.onClose();
    };

    render() {
        return <Dialog
            open={this.props.open}
            onClose={this.props.onClose}
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