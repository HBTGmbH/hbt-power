import {connect} from 'react-redux';
import * as React from 'react';
import {Button, Dialog, DialogActions} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ConsultantEditFields} from './consultant-edit-fields_module.';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ApplicationState} from '../../../reducers/reducerIndex';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {ThunkDispatch} from 'redux-thunk';

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

class ConsultantCreateDialogModule extends React.Component<ConsultantCreateDialogProps
    & ConsultantCreateDialogLocalProps
    & ConsultantCreateDialogDispatch, ConsultantCreateDialogLocalState> {

    constructor(props: ConsultantCreateDialogProps & ConsultantCreateDialogLocalProps & ConsultantCreateDialogDispatch) {
        super(props);
        this.state = {
            consultantInfo: ConsultantInfo.empty()
        };
    }

    static mapStateToProps(_: ApplicationState, __: ConsultantCreateDialogLocalProps): ConsultantCreateDialogProps {
        return {};
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ConsultantCreateDialogDispatch {
        return {
            createConsultant: (info) => dispatch(AdminActionCreator.AsyncCreateConsultant(info))
        };
    }

    private closeAndReset = () => {
        this.setState({
            consultantInfo: ConsultantInfo.empty()
        });
        this.props.onClose();
    };

    private saveAndReset = () => {
        this.props.createConsultant(this.state.consultantInfo);
        this.setState({
            consultantInfo: ConsultantInfo.empty()
        });
        this.props.onClose();
    };

    private setFirstName = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setFirstName(val)
        });
    };

    private setLastName = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setLastName(val)
        });
    };

    private setTitle = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setTitle(val)
        });
    };

    private setInitials = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setInitials(val)
        });
    };

    private setActive = (val: boolean) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setActive(val)
        });
    };

    private setBirthDate = (val: Date) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setBirthDate(val)
        });
    };

    private setProfilePictureId = (profilePictureId: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setProfilePictureId(profilePictureId)
        });
    };


    private readonly dialogActions = [
        <Button
            key="save"
            variant={'text'}
            color={'primary'}
            onClick={this.saveAndReset}
        >
            Speichern
        </Button>
        ,
        <Button
            key="exit"
            variant={'text'}
            color={'primary'}
            onClick={this.closeAndReset}
        >
           Schließen
        </Button>,
    ];

    render() {
        return (<div>
            <Dialog
                scroll={"paper"}
                title={PowerLocalize.get('ConsultantTile.CreateConsultant')}
                open={this.props.show}
                onClose={this.closeAndReset}
            >
                <DialogTitle>
                    {PowerLocalize.get('ConsultantTile.CreateConsultant')}
                </DialogTitle>
                <DialogContent dividers={true} style={{width: '400px', 'overflowX': 'hidden'}}>
                    <ConsultantEditFields
                        firstName={this.state.consultantInfo.firstName()}
                        lastName={this.state.consultantInfo.lastName()}
                        title={this.state.consultantInfo.title()}
                        birthDate={this.state.consultantInfo.birthDate()}
                        active={this.state.consultantInfo.active()}
                        profilePictureId={this.state.consultantInfo.profilePictureId()}
                        onFirstNameChange={this.setFirstName}
                        onLastNameChange={this.setLastName}
                        onTitleChange={this.setTitle}
                        onBirthDateChange={this.setBirthDate}
                        onActiveChange={this.setActive}
                        onProfilePictureIdChange={this.setProfilePictureId}
                    >
                        <LimitedTextField
                            className="pwr-margin-top pwr-margin-bottom"
                            maxCharacters={100}
                            hideProgress={true}
                            value={this.state.consultantInfo.initials()}
                            label={PowerLocalize.get('Initials.Singular')}
                            onChange={(e, v) => this.setInitials(v)}
                        />
                    </ConsultantEditFields>
                </DialogContent>
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
export const ConsultantCreateDialog = connect(ConsultantCreateDialogModule.mapStateToProps, ConsultantCreateDialogModule.mapDispatchToProps)(ConsultantCreateDialogModule);
