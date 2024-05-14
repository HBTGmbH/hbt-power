import {connect} from 'react-redux';
import * as React from 'react';
import {Button, Dialog, DialogContent, DialogTitle, FormControl, Radio, RadioGroup, Step, StepLabel, Stepper, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {NameEntityUtil} from '../../../utils/NameEntityUtil';
import {ProfileEntryNotification} from '../../../model/admin/ProfileEntryNotification';
import {ApplicationState} from '../../../reducers/reducerIndex';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import {provideValueTo} from '../../../utils/ReactUtils';
import {ThunkDispatch} from 'redux-thunk';

// TODO radio button ohne form
/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link NotificationDialog.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface NotificationDialogProps {
    notification: ProfileEntryNotification;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link NotificationDialogProps} and will then be
 * managed by redux.
 */
interface NotificationDialogLocalProps {
    open: boolean;
    index: number;

    onClose(): void;

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface NotificationDialogLocalState {
    stepIndex: number;
    selectedAction: string;
    nameEntityName: string;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface NotificationDialogDispatch {
    executeDeleteAction(id: number): void;

    executeOkAction(id: number): void;

    executePatchAction(notification: ProfileEntryNotification): void;

}

class NotificationDialogModule extends React.Component<NotificationDialogProps
    & NotificationDialogLocalProps
    & NotificationDialogDispatch, NotificationDialogLocalState> {


    constructor(props: NotificationDialogProps & NotificationDialogLocalProps & NotificationDialogDispatch) {
        super(props);
        this.resetDialog();
    }

    private resetDialog = () => {
        this.state = {
            stepIndex: 0,
            selectedAction: 'ok',
            nameEntityName: ''
        };
    };

    static mapStateToProps(state: ApplicationState, localProps: NotificationDialogLocalProps): NotificationDialogProps {
        return {
            notification: state.adminReducer.profileEntryNotifications.get(localProps.index),
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): NotificationDialogDispatch {
        return {
            executeDeleteAction: (id: number) => dispatch(AdminActionCreator.AsyncNotificationInvokeDelete(id)),
            executePatchAction: (notification) => dispatch(AdminActionCreator.AsyncNotificationInvokeEdit(notification)),
            executeOkAction: (id) => dispatch(AdminActionCreator.AsyncNotificationInvokeOK(id))
        };
    }

    private changeNameEntityName = (value: string) => {
        this.setState({
            nameEntityName: value
        });
    };

    private progressStep = () => {
        if (!this.stepperHasFinished()) {
            this.setState({
                stepIndex: this.state.stepIndex + 1,
                nameEntityName: this.state.selectedAction == 'edit' ? this.props.notification.nameEntity.name() : ''
            });
        } else {
            this.executeSelectedAction();
        }
    };

    private backStep = () => {
        this.setState({
            stepIndex: this.state.stepIndex > 0 ? this.state.stepIndex - 1 : this.state.stepIndex
        });
    };

    private setAction = (value: string) => {
        this.setState({
            selectedAction: value
        });
    };

    private stepperHasFinished = () => {
        return (this.state.selectedAction == 'edit' && this.state.stepIndex == 2)
            || (this.state.selectedAction != 'edit' && this.state.stepIndex == 1);
    };

    private executeSelectedAction = () => {
        switch (this.state.selectedAction) {
            case 'ok':
                this.props.executeOkAction(this.props.notification.adminNotification.id());
                break;
            case 'edit':
                let notification = this.props.notification;
                let nameEntity = notification.nameEntity;
                nameEntity = nameEntity.setName(this.state.nameEntityName);
                notification = notification.setNameEntity(nameEntity);
                this.props.executePatchAction(notification);
                break;
            case 'delete':
                this.props.executeDeleteAction(this.props.notification.adminNotification.id());
                break;
        }
        this.closeDialog();
    };

    private closeDialog = () => {
        this.props.onClose();
        this.resetDialog();
    };

    private renderStepper = () => {
        // Unfortunately, this is necessary because the Stepper will attempt to render null or false
        // JSX elements in its children. Mixins don't work here
        if (this.state.selectedAction == 'edit') {
            return <Stepper activeStep={this.state.stepIndex}>
                <Step>
                    <StepLabel>{PowerLocalize.get('NotificationDialog.Stepper.Label.Step0')}</StepLabel>
                </Step>
                <Step>
                    <StepLabel>{PowerLocalize.get('NotificationDialog.Stepper.Label.Step1')}</StepLabel>
                </Step>
                <Step>
                    <StepLabel>{PowerLocalize.get('NotificationDialog.Stepper.Label.Step2')}</StepLabel>
                </Step>
            </Stepper>;
        } else {
            return <Stepper activeStep={this.state.stepIndex}>
                <Step>
                    <StepLabel>{PowerLocalize.get('NotificationDialog.Stepper.Label.Step0')}</StepLabel>
                </Step>
                <Step>
                    <StepLabel>{PowerLocalize.get('NotificationDialog.Stepper.Label.Step1')}</StepLabel>
                </Step>
            </Stepper>;
        }

    };

    private renderStepperControl = () => {
        return <div style={{marginTop: 12}}>
            <Button
                id="NotificationActionDialog.Prev"
                variant={'text'}
                disabled={this.state.stepIndex == 0}
                onClick={this.backStep}
                style={{marginRight: 12}}
            >
                {PowerLocalize.get('Action.Previous')}
            </Button>
            <Button
                id="NotificationActionDialog.Next"
                variant={'contained'}
                color={'primary'}
                onClick={this.progressStep}
            >
                {this.stepperHasFinished() ? PowerLocalize.get('Action.Execute') : PowerLocalize.get('Action.Next')}
            </Button>
        </div>;
    };

    private renderStepperContentIndex0 = () => {
        return (
            <div>
                Im Profil von <strong>{this.props.notification.adminNotification.initials()}</strong> wurde der neue
                Bezeichner <strong>
                {this.props.notification.nameEntity.name()}</strong> hinzugefügt.
                Dies betrifft den
                Eintragstyp <strong>{NameEntityUtil.typeToLocalizedType(this.props.notification.nameEntity)}</strong>
                <br/>
                Bitte wählen sie im nächsten Schritt eine Aktion.
            </div>);
    };

    private renderStepperContentIndex1 = () => {
        return (
            <div>
                <FormControl>
                    <RadioGroup
                        name="notificationActions"
                        id="NotificationDialog.Actions.RadioGroup"
                        value={this.state.selectedAction}
                        onChange={provideValueTo(this.setAction)}
                        style={{width: '100%'}}
                    >
                        <FormControlLabel value='ok'
                                          control={<Radio id="NotificationDialog.Action.ok.Radio" color="primary"/>}
                                          label={PowerLocalize.get('Action.OK')}/>
                        <FormControlLabel value="delete"
                                          control={<Radio id="NotificationDialog.Action.delete.Radio" color="primary"/>}
                                          label={PowerLocalize.get('Action.Delete')}/>
                        <FormControlLabel value="edit"
                                          control={<Radio id="NotificationDialog.Action.edit.Radio" color="primary"/>}
                                          label={PowerLocalize.get('Action.Edit')}/>
                    </RadioGroup>
                </FormControl>
                <div style={{width: '100%', marginTop: '16px', marginBottom: '16px'}}>
                    <strong>{PowerLocalize.get('Action.OK') + ': '}</strong>{PowerLocalize.get('NotificationDialog.ActionOK.Description')}<br/><br/>
                    <strong>{PowerLocalize.get('Action.Delete') + ': '}</strong>{PowerLocalize.get('NotificationDialog.ActionDelete.Description')}<br/><br/>
                    <strong>{PowerLocalize.get('Action.Edit') + ': '}</strong>{PowerLocalize.get('NotificationDialog.ActionEdit.Description')}<br/><br/>
                </div>
            </div>
        );
    };

    private renderStepperContentIndex2 = () => {
        return (<div>
                <TextField
                    id="NotificationDialog.Action.Edit.NewName"
                    label={PowerLocalize.get('NotificationDialog.EditNameEntity')}
                    value={this.state.nameEntityName}
                    onChange={provideValueTo(this.changeNameEntityName)}
                />
            </div>
        );
    };

    private renderStepperContent = () => {
        if (!!this.props.notification) {
            switch (this.state.stepIndex) {
                case 0:
                    return this.renderStepperContentIndex0();
                case 1:
                    return this.renderStepperContentIndex1();
                case 2:
                    return this.renderStepperContentIndex2();
            }

        }
        return <div/>;
    };

    render() {
        if (!!this.props.notification) {
            return <Dialog id="NotificationDialog"
                           open={this.props.open}
                           onClose={this.closeDialog}
                           scroll={'paper'}
                           fullWidth
            >
                <DialogTitle id="NotificationDialog.Title">
                    {PowerLocalize.get('Qualification.Dialog.Title')}
                </DialogTitle>
                <DialogContent id="NotificationDialog.Content">
                    {this.renderStepperContent()}
                    {this.renderStepper()}
                    {this.renderStepperControl()}
                </DialogContent>
            </Dialog>;
        }
        return <></>;
    }
}

/**
 * @see NotificationDialogModule
 * @author nt
 * @since 31.05.2017
 */
export const NotificationDialog = connect(NotificationDialogModule.mapStateToProps, NotificationDialogModule.mapDispatchToProps)(NotificationDialogModule);
