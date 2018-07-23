import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {Button, Dialog, DialogActions} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ConsultantEditFields} from './consultant-edit-fields_module.';
import {ApplicationState} from '../../../reducers/reducerIndex';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ConsultantEditDialog.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ConsultantEditDialogProps {
    consultantInfo: ConsultantInfo;

}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ConsultantEditDialogProps} and will then be
 * managed by redux.
 */
interface ConsultantEditDialogLocalProps {
    initials: string;
    show: boolean;
    onClose(): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ConsultantEditDialogLocalState {
    editDisabled: boolean;
    consultantInfo: ConsultantInfo;

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ConsultantEditDialogDispatch {
    redirectToUser(initials: string): void;
    updateConsultant(info: ConsultantInfo): void;
}

class ConsultantEditDialogModule extends React.Component<
    ConsultantEditDialogProps
    & ConsultantEditDialogLocalProps
    & ConsultantEditDialogDispatch, ConsultantEditDialogLocalState> {


    constructor(props: ConsultantEditDialogProps & ConsultantEditDialogLocalProps & ConsultantEditDialogDispatch) {
        super(props);
        this.state = {
            editDisabled: false,
            consultantInfo: props.consultantInfo,
        };
    }


    static mapStateToProps(state: ApplicationState, localProps: ConsultantEditDialogLocalProps): ConsultantEditDialogProps {
        return {
            consultantInfo: state.adminReducer.consultantsByInitials().get(localProps.initials)
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConsultantEditDialogDispatch {
        return {
            redirectToUser: initials => dispatch(AdminActionCreator.AsyncRedirectToUser(initials)),
            updateConsultant:(info) => dispatch(AdminActionCreator.AsyncUpdateConsultant(info))
        };
    }

    private setEditDisabled = (disabled: boolean) => {
        this.setState({
            editDisabled: disabled
        });
    };

    private setFirstName = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.firstName(val)
        });
    };

   private setLastName = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.lastName(val)
        });
    };

    private setActive = (val: boolean) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.active(val)
        });
    };

    private setTitle = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.title(val)
        })
    };

    private setBirthDate = (val: Date) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.birthDate(val)
        })
    };

    private closeDialog = () => {
        this.props.onClose();
    };

    private resetAndClose = () => {
        this.setState({
            consultantInfo: this.props.consultantInfo
        });
        this.closeDialog();
    };

    private saveAndClose = () => {
        this.closeDialog();
        this.props.updateConsultant(this.state.consultantInfo);
    };

    private readonly dialogActions = [

        <Button
            key="save"
            variant={'raised'}
            color={'primary'}
            onClick={this.saveAndClose}
            style={{width:'30%', height:'10%'}}
        >
            {PowerLocalize.get("Action.Save")}
        </Button>,

        <Button
            key="edit"
            variant={'raised'}
            color={'primary'}
            onClick={() => {this.props.redirectToUser(this.props.initials)}}
            style={{width:'30%', height:'10%'}}
        >
            {PowerLocalize.get("ConsultantTile.EditProfile")}
            </Button>,

        <Button
            variant={'raised'}
            color={'primary'}
            onClick={this.resetAndClose}
            key="exit"
            style={{width:'30%', height:'10%'}}
        >
            {PowerLocalize.get("Action.Exit")}
        </Button>,
    ];

    render() {
        return (<div>
            <Dialog
                title={PowerLocalize.get('ConsultantTile.EditConsultant')}
                open={this.props.show}
                onClose={this.closeDialog}
            >
                <DialogTitle>{PowerLocalize.get('ConsultantTile.EditConsultant')}</DialogTitle>
                <DialogContent>
                    <ConsultantEditFields
                        firstName = {this.state.consultantInfo.firstName()}
                        lastName = {this.state.consultantInfo.lastName()}
                        title = {this.state.consultantInfo.title()}
                        birthDate={this.state.consultantInfo.birthDate()}
                        active={this.state.consultantInfo.active()}
                        onFirstNameChange={this.setFirstName}
                        onLastNameChange={this.setLastName}
                        onTitleChange={this.setTitle}
                        onBirthDateChange={this.setBirthDate}
                        onActiveChange={this.setActive}
                    />
                </DialogContent>
                <DialogActions>
                    {this.dialogActions}
                </DialogActions>
            </Dialog>
        </div>);
    }
}

/**
 * @see ConsultantEditDialogModule
 * @author nt
 * @since 08.06.2017
 */
export const ConsultantEditDialog: React.ComponentClass<ConsultantEditDialogLocalProps> = connect(ConsultantEditDialogModule.mapStateToProps, ConsultantEditDialogModule.mapDispatchToProps)(ConsultantEditDialogModule);