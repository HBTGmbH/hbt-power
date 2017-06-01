import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {AdminNotification} from '../../model/admin/AdminNotification';
import {Dialog, FlatButton, RadioButton, RadioButtonGroup, RaisedButton, Step, StepLabel, TextField} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {Stepper} from 'material-ui/Stepper';
import {NameEntityUtil} from '../../utils/NameEntityUtil';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link NotificationDialog.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface NotificationDialogProps {
    notification: AdminNotification;
    username: string;
    password: string;
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

    onRequestClose(): void;

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
    executeDeleteAction(id: number, user: string, pass:string): void;
    executeOkAction(id: number, user: string, pass:string): void;
    executePatchAction(notification: AdminNotification, user: string, pass:string): void;
}

class NotificationDialogModule extends React.Component<
    NotificationDialogProps
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
            nameEntityName: ""
        };
    };

    static mapStateToProps(state: ApplicationState, localProps: NotificationDialogLocalProps): NotificationDialogProps {
        return {
            notification: state.adminReducer.notifications().get(localProps.index),
            username: state.adminReducer.adminName(),
            password: state.adminReducer.adminPass()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NotificationDialogDispatch {
        return {
            executeDeleteAction: (id, user, pass) => dispatch(AdminActionCreator.AsyncNotificationInvokeDelete(id, user, pass)),
            executePatchAction:  (notification, user, pass) => dispatch(AdminActionCreator.AsyncNotificationInvokeEdit(notification, user, pass)),
            executeOkAction: (id, user, pass) => dispatch(AdminActionCreator.AsyncNotificationInvokeOK(id, user, pass))
        };
    }

    private changeNameEntityName = (event: any, value: string) => {
        this.setState({
            nameEntityName: value
        });
    };

    private progressStep = () => {
        if(!this.stepperHasFinished()) {
            this.setState({
                stepIndex: this.state.stepIndex + 1,
                nameEntityName: this.state.selectedAction == 'edit' ? this.props.notification.nameEntity().name() : ""
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

    private setAction = (event: any, value: string) => {
        this.setState({
            selectedAction: value
        });
    };

    private stepperHasFinished = () => {
        return (this.state.selectedAction == 'edit' && this.state.stepIndex == 2)
            || (this.state.selectedAction != 'edit' && this.state.stepIndex == 1);
    };

    private executeSelectedAction = () => {
        switch(this.state.selectedAction){
            case 'ok':
                this.props.executeOkAction(this.props.notification.id(), this.props.username, this.props.password);
                break;
            case 'edit':
                let notification = this.props.notification;
                let nameEntity = notification.nameEntity();
                nameEntity = nameEntity.name(this.state.nameEntityName);
                notification = notification.nameEntity(nameEntity);
                this.props.executePatchAction(notification, this.props.username, this.props.password);
                break;
            case 'delete':
                this.props.executeDeleteAction(this.props.notification.id(), this.props.username, this.props.password);
                break;
        }
        this.closeDialog();
    };

    private closeDialog = () => {
        this.props.onRequestClose();
        this.resetDialog();
    }

    private renderStepper = () => {
        // Unfortunately, this is necessary because the Stepper will attempt to render null or false
        // JSX elements in its children. Mixins don't work here
        if(this.state.selectedAction == 'edit') {
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
            <FlatButton
                label={PowerLocalize.get('Action.Previous')}
                disabled={this.state.stepIndex == 0}
                onTouchTap={this.backStep}
                style={{marginRight: 12}}
            />
            <RaisedButton
                label={this.stepperHasFinished() ? PowerLocalize.get('Action.Execute') : PowerLocalize.get('Action.Next')}
                primary={true}
                onTouchTap={this.progressStep}
            />
        </div>;
    };

    private renderStepperContentIndex0 = () => {
        return (
            <div>
                Im Profil von <strong>{this.props.notification.initials()}</strong> wurde der neue Bezeichner <strong>
                {this.props.notification.nameEntity().name()}</strong> hinzugefügt.
                Dies betrifft den Eintragstyp <strong>{NameEntityUtil.typeToLocalizedType(this.props.notification.nameEntity())}</strong>
                <br/>
                Bitte wählen sie im nächsten Schritt eine Aktion.
            </div>);
    };

    private renderStepperContentIndex1 = () => {
        return (
            <div className="vertical-align">
                <RadioButtonGroup
                    name="notificationActions"
                    defaultSelected="ok"
                    onChange={this.setAction}
                >
                    <RadioButton
                        value="ok"
                        label={PowerLocalize.get('Action.OK')}
                    />
                    <RadioButton
                        value="delete"
                        label={PowerLocalize.get('Action.Delete')}
                    />
                    <RadioButton
                        value="edit"
                        label={PowerLocalize.get('Action.Edit')}
                    />
                </RadioButtonGroup>
            </div>
        )
    };

    private renderStepperContentIndex2 = () => {
        return (<div>
                <TextField
                    floatingLabelText={PowerLocalize.get("NotificationDialog.EditNameEntity")}
                    value={this.state.nameEntityName}
                    onChange={this.changeNameEntityName}
                    />
            </div>
        )
    };

    private renderStepperContent = () => {
        if(!isNullOrUndefined(this.props.notification)) {
            switch(this.state.stepIndex){
                case 0: return this.renderStepperContentIndex0();
                case 1: return this.renderStepperContentIndex1();
                case 2: return this.renderStepperContentIndex2();
            }

        }
        return <div/>
    };


    render() {
        if(!isNullOrUndefined(this.props.notification)) {
            return (<div>
                <Dialog
                    modal={false}
                    open={this.props.open}
                    onRequestClose={this.closeDialog}
                >
                    {this.renderStepper()}
                    {this.renderStepperContent()}
                    {this.renderStepperControl()}

                </Dialog>
            </div>);
        }
        return null;
    }
}

/**
 * @see NotificationDialogModule
 * @author nt
 * @since 31.05.2017
 */
export const NotificationDialog: React.ComponentClass<NotificationDialogLocalProps> = connect(NotificationDialogModule.mapStateToProps, NotificationDialogModule.mapDispatchToProps)(NotificationDialogModule);