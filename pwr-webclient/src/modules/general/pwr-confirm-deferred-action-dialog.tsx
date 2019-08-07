import * as React from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import * as redux from 'redux';
import {Button, Dialog, DialogContentText, DialogTitle} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import DialogActions from '@material-ui/core/DialogActions';
import {confirmDeferredAction, rejectDeferredAction} from '../../reducers/deferred/DeferredActions';
import {connect} from 'react-redux';
import DialogContent from '@material-ui/core/DialogContent';

interface ConfirmDeferredProps {
    dialogOpen: boolean;
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
            dialogOpen: state.deferred.deferredAction != null
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConfirmDeferredPropsDispatch {
        return {
            confirmAction: () => dispatch(confirmDeferredAction()),
            rejectAction: () => dispatch(rejectDeferredAction())
        };
    }

    handleKeyDown = (key: string) => {
        if (key === 'Enter') {
            this.props.confirmAction()
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
                {PowerLocalize.get('ConfirmNavDialog.Title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {PowerLocalize.get('ConfirmNavDialog.Content')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={this.props.confirmAction}>
                    {PowerLocalize.get('ConfirmNavDialog.Action.NavigateAnyway')}
                </Button>
                <Button color='secondary' onClick={this.props.rejectAction}>
                    {PowerLocalize.get('ConfirmNavDialog.Action.CancelNavigation')}
                </Button>
            </DialogActions>
        </Dialog>);
    }
}

export const PwrConfirmDeferredActionDialog: React.ComponentClass<ConfirmDeferredLocalProps> =
    connect(
        PwrConfirmDeferredActionDialogModule.mapStateToProps,
        PwrConfirmDeferredActionDialogModule.mapDispatchToProps
    )
    (PwrConfirmDeferredActionDialogModule);

