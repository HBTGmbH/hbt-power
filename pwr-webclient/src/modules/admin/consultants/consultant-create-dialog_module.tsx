import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {Dialog, FlatButton} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ConsultantEditFields} from './consultant-edit-fields_module.';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {LimitedTextField} from '../../general/limited-text-field-module.';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';

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
    onRequestClose(): void;
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
        this.props.onRequestClose();
    };

    private saveAndReset = () => {
        this.props.createConsultant(this.state.consultantInfo);
        this.props.onRequestClose();
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

    private setBirthDate = (val: Date) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.birthDate(val)
        })
    };


    private readonly dialogActions = [

        <FlatButton
            label={PowerLocalize.get("Action.Save")}
            primary={true}
            onTouchTap={this.saveAndReset}
        />,
        <FlatButton
            label={PowerLocalize.get("Action.Exit")}
            primary={true}
            onTouchTap={this.closeAndReset}
        />,
    ];

    render() {
        return (<div>
            <Dialog
                title={PowerLocalize.get('ConsultantTile.CreateConsultant')}
                open={this.props.show}
                actions={this.dialogActions}
                onRequestClose={this.closeAndReset}
            >
                <ConsultantEditFields
                    firstName = {this.state.consultantInfo.firstName()}
                    lastName = {this.state.consultantInfo.lastName()}
                    title = {this.state.consultantInfo.title()}
                    birthDate={this.state.consultantInfo.birthDate()}
                    onFirstNameChange={this.setFirstName}
                    onLastNameChange={this.setLastName}
                    onTitleChange={this.setTitle}
                    onBirthDateChange={this.setBirthDate}
                >
                    <LimitedTextField
                        maxCharacters={100}
                        value={this.state.consultantInfo.initials()}
                        floatingLabelText={PowerLocalize.get('Initials.Singular')}
                        onChange={(e, v) => this.setInitials(v)}
                    />
                </ConsultantEditFields>
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