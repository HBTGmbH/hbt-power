import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Dialog, FlatButton} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {ApplicationState} from '../../reducers/reducerIndex';

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

class ConfirmNavDialogModule extends React.Component<
    ConfirmNavDialogProps
    & ConfirmNavDialogLocalProps
    & ConfirmNavDialogDispatch, ConfirmNavDialogLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ConfirmNavDialogLocalProps): ConfirmNavDialogProps {
        return {
            dialogOpen: state.navigationSlice.confirmDialogOpen()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConfirmNavDialogDispatch {
        return {
            continueNavigation: () => dispatch(NavigationActionCreator.AsyncContinueToTarget()),
            dropNavigationTarget: () => dispatch(NavigationActionCreator.DropNavigationTarget())
        }
    }

    render() {
        return (<Dialog
            open={this.props.dialogOpen}
            title={PowerLocalize.get("ConfirmNavDialog.Title")}
            actions={[
                <FlatButton
                    label={PowerLocalize.get("ConfirmNavDialog.Action.NavigateAnyway")}
                    primary={true}
                    onClick={this.props.continueNavigation}
                />,
                <FlatButton
                    label={PowerLocalize.get("ConfirmNavDialog.Action.CancelNavigation")}
                    primary={true}
                    onClick={this.props.dropNavigationTarget}
                />
            ]}
        >
            {PowerLocalize.get("ConfirmNavDialog.Content")}
        </Dialog>);
    }
}

/**
 * @see ConfirmNavDialogModule
 * @author nt
 * @since 23.08.2017
 */
export const ConfirmNavDialog: React.ComponentClass<ConfirmNavDialogLocalProps> = connect(ConfirmNavDialogModule.mapStateToProps, ConfirmNavDialogModule.mapDispatchToProps)(ConfirmNavDialogModule);