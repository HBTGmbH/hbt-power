import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Dialog, Button,DialogActions} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ConsultantEditFields} from './consultant-edit-fields_module.';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ApplicationState} from '../../../reducers/reducerIndex';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ConsultantCreateDialog.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ConsultantCreateDialogProps {

}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ConsultantCreateDialogProps} and will then be
 * managed by redux.
 */
interface ConsultantCreateDialogLocalProps {
    show: boolean;
    onClose(): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ConsultantCreateDialogLocalState {
    consultantInfo: ConsultantInfo;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ConsultantCreateDialogDispatch {
    createConsultant(consultantInfo: ConsultantInfo): void;
}

class ConsultantCreateDialogModule extends React.Component<
    ConsultantCreateDialogProps
    & ConsultantCreateDialogLocalProps
    & ConsultantCreateDialogDispatch, ConsultantCreateDialogLocalState> {

    constructor(props: ConsultantCreateDialogProps & ConsultantCreateDialogLocalProps & ConsultantCreateDialogDispatch) {
        super(props);
        this.state = {
            consultantInfo: ConsultantInfo.empty()
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: ConsultantCreateDialogLocalProps): ConsultantCreateDialogProps {
        return {}
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConsultantCreateDialogDispatch {
        return {
            createConsultant: (info) => dispatch(AdminActionCreator.AsyncCreateConsultant(info))
        }
    }

    private closeAndReset = () => {
        this.setState ({
            consultantInfo: ConsultantInfo.empty()
        });
        this.props.onClose();
    };

    private saveAndReset = () => {
        this.props.createConsultant(this.state.consultantInfo);
        this.props.onClose();
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

    private setTitle = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.title(val)
        })
    };

    private setInitials = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.initials(val)
        })
    };

    private setActive = (val: boolean) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.active(val)
        })
    };

    private setBirthDate = (val: Date) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.birthDate(val)
        })
    };


    private readonly dialogActions = [

        <Button
            variant={'flat'}
            color={'primary'}
            onClick={this.saveAndReset}
        >
            {PowerLocalize.get("Action.Save")}
        </Button>
        ,
        <Button
            variant={'flat'}
            color={'primary'}
            onClick={this.closeAndReset}
        >
            {PowerLocalize.get("Action.Exit")}
        </Button>,
    ];

    render() {
        return (<div>
            <Dialog
                title={PowerLocalize.get('ConsultantTile.CreateConsultant')}
                open={this.props.show}
                onClose={this.closeAndReset}
            >
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
                >
                    <LimitedTextField
                        maxCharacters={100}
                        value={this.state.consultantInfo.initials()}
                        label={PowerLocalize.get('Initials.Singular')}
                        onChange={(e, v) => this.setInitials(v)}
                    />

                </ConsultantEditFields>
                <DialogActions>
                    {this.dialogActions}
                </DialogActions>
            </Dialog>
        </div>);
    }
}

/**
 * @see ConsultantCreateDialogModule
 * @author nt
 * @since 08.06.2017
 */
export const ConsultantCreateDialog: React.ComponentClass<ConsultantCreateDialogLocalProps> = connect(ConsultantCreateDialogModule.mapStateToProps, ConsultantCreateDialogModule.mapDispatchToProps)(ConsultantCreateDialogModule);