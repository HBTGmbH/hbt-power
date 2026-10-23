import {connect} from 'react-redux';
import * as React from 'react';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {LocalDate} from '../../../utils/DateUtil';
import {Dialog, DialogActions, Icon, Link, Typography} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ConsultantEditFields} from './consultant-edit-fields_module.';
import {ApplicationState} from '../../../reducers/reducerIndex';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {ThunkDispatch} from 'redux-thunk';

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
    redirectToUserHome(initials: string): void;

    updateConsultant(info: ConsultantInfo): void;

    deleteConsultant(initials: string, fullName: string): void;
}

class ConsultantEditDialogModule extends React.Component<ConsultantEditDialogProps
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
            consultantInfo: state.adminReducer.consultantsByInitials.get(localProps.initials)
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ConsultantEditDialogDispatch {
        return {
            redirectToUserHome: initials => dispatch(AdminActionCreator.AsyncRedirectToUserHome(initials)),
            updateConsultant: (info) => dispatch(AdminActionCreator.AsyncUpdateConsultant(info)),
            deleteConsultant: (initials, fullName) => dispatch(AdminActionCreator.AsyncDeleteConsultant(initials, fullName))
        };
    }

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

    private setActive = (val: boolean) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setActive(val)
        });
    };

    private setProfilePictureId = (profilePictureId: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setProfilePictureId(profilePictureId)
        });
    };

    private setTitle = (val: string) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setTitle(val)
        });
    };

    private setBirthDate = (val: LocalDate | null) => {
        this.setState({
            consultantInfo: this.state.consultantInfo.setBirthDate(val)
        });
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

    private deleteConsultant = () => {
        // The saved name, not one being edited in the dialog
        this.props.deleteConsultant(this.props.consultantInfo.initials(), this.props.consultantInfo.getFullName());
        this.closeDialog();
    };


    render() {
        return (<div>
            <Dialog
                scroll="paper"
                fullWidth
                maxWidth="sm"
                id={'ConsultantTile.EditConsultant.Dialog'}
                aria-labelledby="ConsultantTile.EditConsultant.Dialog.Title"
                open={this.props.show}
                onClose={this.closeDialog}
            >
                {/* Jump to the consultant's overview on the right of the title (#195, #211): a link, not one of the
                    form's actions */}
                <DialogTitle disableTypography className="pwr-dialog-title-with-link">
                    <Typography variant="h6" id="ConsultantTile.EditConsultant.Dialog.Title">
                        {PowerLocalize.get('ConsultantTile.EditConsultant')}
                    </Typography>
                    <Link component="button" variant="body2" className="pwr-link-with-icon"
                          onClick={() => this.props.redirectToUserHome(this.props.initials)}>
                        {PowerLocalize.get('ConsultantEdit.OpenOverview')}
                        <Icon className="material-icons" fontSize="small">arrow_forward</Icon>
                    </Link>
                </DialogTitle>
                <DialogContent dividers={true}>
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
                    />
                </DialogContent>
                <DialogActions>
                    {/* Button bar (#41): Save highlighted, Cancel next to it, Delete set apart (inactive consultants only) */}
                    <PwrFormActions editing noSpace
                                    onSave={this.saveAndClose}
                                    onCancel={this.resetAndClose}
                                    onDelete={this.props.consultantInfo.active() ? undefined : this.deleteConsultant}/>
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
export const ConsultantEditDialog = connect(ConsultantEditDialogModule.mapStateToProps, ConsultantEditDialogModule.mapDispatchToProps)(ConsultantEditDialogModule);
