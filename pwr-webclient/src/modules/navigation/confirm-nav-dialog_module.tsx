import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Button, Dialog} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {ApplicationState} from '../../reducers/reducerIndex';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';

interface ConfirmNavDialogProps {
    dialogOpen: boolean;
}

interface ConfirmNavDialogLocalProps {

}

interface ConfirmNavDialogLocalState {

}

interface ConfirmNavDialogDispatch {
    continueNavigation(): void;

    dropNavigationTarget(): void;
}

class ConfirmNavDialogModule extends React.Component<ConfirmNavDialogProps
    & ConfirmNavDialogLocalProps
    & ConfirmNavDialogDispatch, ConfirmNavDialogLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ConfirmNavDialogLocalProps): ConfirmNavDialogProps {
        return {
            dialogOpen: state.navigationSlice.confirmDialogOpen()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConfirmNavDialogDispatch {
        return {
            continueNavigation: () => dispatch(NavigationActionCreator.AsyncContinueToTarget()),
            dropNavigationTarget: () => dispatch(NavigationActionCreator.DropNavigationTarget())
        };
    }

    render() {
        return (<Dialog
            open={this.props.dialogOpen}
            title={PowerLocalize.get('ConfirmNavDialog.Title')}
        >
            {PowerLocalize.get('ConfirmNavDialog.Content')}
            <DialogActions>
                <Button
                    variant={'text'}
                    color={'primary'}
                    onClick={this.props.dropNavigationTarget}
                >
                    {PowerLocalize.get('ConfirmNavDialog.Action.CancelNavigation')}
                </Button>
                <Button
                    variant={'text'}
                    color={'primary'}
                    onClick={this.props.continueNavigation}
                >
                    {PowerLocalize.get('ConfirmNavDialog.Action.NavigateAnyway')}
                </Button>
            </DialogActions>
        </Dialog>);
    }
}

/**
 * @see ConfirmNavDialogModule
 * @author nt
 * @since 23.08.2017
 */
export const ConfirmNavDialog: React.ComponentClass<ConfirmNavDialogLocalProps> = connect(ConfirmNavDialogModule.mapStateToProps, ConfirmNavDialogModule.mapDispatchToProps)(ConfirmNavDialogModule);
