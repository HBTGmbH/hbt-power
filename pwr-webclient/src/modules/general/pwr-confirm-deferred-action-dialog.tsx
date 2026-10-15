import * as React from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import * as redux from 'redux';
import {Button, Dialog, DialogContentText, DialogTitle} from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import {confirmDeferredAction, rejectDeferredAction} from '../../reducers/deferred/DeferredActions';
import {connect} from 'react-redux';
import DialogContent from '@material-ui/core/DialogContent';

interface ConfirmDeferredProps {
    dialogOpen: boolean;
    actionOK: string;
    actionNOK: string;
    content: string;
    header: string;
}

interface ConfirmDeferredLocalProps {

}

interface ConfirmDeferredLocalState {
}

interface ConfirmDeferredPropsDispatch {
    confirmAction(): void;

    rejectAction(): void;
}

class PwrConfirmDeferredActionDialogModule extends React.Component<ConfirmDeferredProps & ConfirmDeferredLocalProps & ConfirmDeferredPropsDispatch, ConfirmDeferredLocalState> {


    constructor(props: ConfirmDeferredProps & ConfirmDeferredLocalProps & ConfirmDeferredPropsDispatch, context: any) {
        super(props, context);
    }

    static mapStateToProps(state: ApplicationState, localProps: ConfirmDeferredLocalProps): ConfirmDeferredProps {
        return {
            dialogOpen: state.deferred.deferredAction != null,
            actionNOK: state.deferred.dialogActionNOK,
            actionOK: state.deferred.dialogActionOK,
            content: state.deferred.dialogContent,
            header: state.deferred.dialogHeader
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch): ConfirmDeferredPropsDispatch {
        return {
            confirmAction: () => dispatch(confirmDeferredAction()),
            rejectAction: () => dispatch(rejectDeferredAction())
        };
    }

    handleKeyDown = (key: string) => {
        if (key === 'Enter') {
            this.props.confirmAction();
        }
        if (key === 'Escape') {
            this.props.rejectAction();
        }
    };

    render() {
        return (<Dialog
            open={this.props.dialogOpen}
            onKeyDown={(event) => this.handleKeyDown(event.key)}
        >
            <DialogTitle>
                {this.props.header}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {this.props.content}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={this.props.rejectAction}>
                    {this.props.actionNOK}
                </Button>
                <Button color='primary' onClick={this.props.confirmAction}>
                    {this.props.actionOK}
                </Button>
            </DialogActions>
        </Dialog>);
    }
}

export const PwrConfirmDeferredActionDialog =
    connect(
        PwrConfirmDeferredActionDialogModule.mapStateToProps,
        PwrConfirmDeferredActionDialogModule.mapDispatchToProps
    )
    (PwrConfirmDeferredActionDialogModule);

