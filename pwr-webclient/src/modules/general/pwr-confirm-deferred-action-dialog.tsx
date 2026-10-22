import * as React from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import * as redux from 'redux';
import {Dialog, DialogContentText, DialogTitle} from '@material-ui/core';
import {PwrConfirmActions} from './pwr-form-actions';
import DialogActions from '@material-ui/core/DialogActions';
import {confirmDeferredAction, matchesConfirmName, rejectDeferredAction} from '../../reducers/deferred/DeferredActions';
import {connect} from 'react-redux';
import DialogContent from '@material-ui/core/DialogContent';
import {PwrInputField} from './pwr-input-field';
import {PwrSpacer} from './pwr-spacer_module';
import {PowerLocalize} from '../../localization/PowerLocalizer';

interface ConfirmDeferredProps {
    dialogOpen: boolean;
    actionOK: string;
    actionNOK: string;
    content: string;
    header: string;
    /** Deleting in the admin area (#181): has to be entered twice; empty for a simple question */
    confirmName: string;
}

interface ConfirmDeferredLocalProps {

}

interface ConfirmDeferredLocalState {
    nameInput: string;
    nameRepeat: string;
}

interface ConfirmDeferredPropsDispatch {
    confirmAction(): void;

    rejectAction(): void;
}

type ConfirmDeferredAllProps = ConfirmDeferredProps & ConfirmDeferredLocalProps & ConfirmDeferredPropsDispatch;

const emptyInputs: ConfirmDeferredLocalState = {
    nameInput: '',
    nameRepeat: ''
};

class PwrConfirmDeferredActionDialogModule extends React.Component<ConfirmDeferredAllProps, ConfirmDeferredLocalState> {


    constructor(props: ConfirmDeferredAllProps, context: any) {
        super(props, context);
        this.state = emptyInputs;
    }

    static mapStateToProps(state: ApplicationState, localProps: ConfirmDeferredLocalProps): ConfirmDeferredProps {
        return {
            dialogOpen: state.deferred.deferredAction != null,
            actionNOK: state.deferred.dialogActionNOK,
            actionOK: state.deferred.dialogActionOK,
            content: state.deferred.dialogContent,
            header: state.deferred.dialogHeader,
            confirmName: state.deferred.confirmName
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch): ConfirmDeferredPropsDispatch {
        return {
            confirmAction: () => dispatch(confirmDeferredAction()),
            rejectAction: () => dispatch(rejectDeferredAction())
        };
    }

    private confirmed = () => {
        return !this.props.confirmName
            || (matchesConfirmName(this.state.nameInput, this.props.confirmName)
                && matchesConfirmName(this.state.nameRepeat, this.props.confirmName));
    };

    private confirm = () => {
        if (this.confirmed()) {
            this.setState(emptyInputs);
            this.props.confirmAction();
        }
    };

    private reject = () => {
        this.setState(emptyInputs);
        this.props.rejectAction();
    };

    handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            // Closing gives the focus back to the delete button; the same Enter would click it and ask again
            event.preventDefault();
            this.confirm();
        }
        if (event.key === 'Escape') {
            this.reject();
        }
    };

    render() {
        const confirmName = this.props.confirmName;
        return (<Dialog
            open={this.props.dialogOpen}
            onKeyDown={this.handleKeyDown}
        >
            <DialogTitle>
                {this.props.header}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {this.props.content}
                </DialogContentText>
                {confirmName && <>
                    <DialogContentText>
                        {PowerLocalize.getFormatted('ConfirmDeleteByName.Hint', confirmName)}
                    </DialogContentText>
                    <PwrInputField fullWidth autoFocus autoComplete="off"
                                   label={PowerLocalize.get('ConfirmDeleteByName.Input')}
                                   value={this.state.nameInput}
                                   onValueChange={value => this.setState({nameInput: value})}/>
                    <PwrSpacer/>
                    <PwrInputField fullWidth autoComplete="off"
                                   label={PowerLocalize.get('ConfirmDeleteByName.Repeat')}
                                   value={this.state.nameRepeat}
                                   onValueChange={value => this.setState({nameRepeat: value})}/>
                </>}
            </DialogContent>
            <DialogActions>
                {/* Only deleting is deferred, so the confirmation is always destructive */}
                <PwrConfirmActions destructive confirmText={this.props.actionOK} onConfirm={this.confirm}
                                   confirmDisabled={!this.confirmed()}
                                   rejectText={this.props.actionNOK} onReject={this.reject}/>
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
