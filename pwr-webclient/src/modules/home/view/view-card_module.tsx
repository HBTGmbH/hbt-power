import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {
    Card, CardHeader, FlatButton, FontIcon, Paper, Subheader, TextField, IconMenu, IconButton,
    MenuItem
} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfile} from '../../../model/viewprofile/ViewProfile';
import {ProfileActionCreator} from '../../../reducers/profile/ProfileActionCreator';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {LimitedTextField} from '../../general/limited-text-field-module.';
import {ConsultantInfo} from '../../../model/ConsultantInfo';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ViewCard.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ViewCardProps {
    viewProfile: ViewProfile;
    loggedInUser: ConsultantInfo;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ViewCardProps} and will then be
 * managed by redux.
 */
interface ViewCardLocalProps {
    viewProfileId: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ViewCardLocalState {
    nameInputDisabled: boolean;
    descriptionInputDisabled: boolean;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ViewCardDispatch {
    deleteViewProfile(id: string, initials: string): void;
    selectViewProfile(id: string): void;
    changeViewProfileName(id: string, val: string): void;
    changeViewProfileDescription(id: string, description: string): void;
    saveViewProfileChanges(id: string, name: string, description: string): void;
    duplicateViewProfile(id: string): void;
}

class ViewCardModule extends React.Component<ViewCardProps & ViewCardLocalProps & ViewCardDispatch, ViewCardLocalState> {

    constructor(props: ViewCardProps & ViewCardLocalProps & ViewCardDispatch) {
        super(props);
        this.state = {
            nameInputDisabled: true,
            descriptionInputDisabled: true
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ViewCardLocalProps): ViewCardProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            loggedInUser: state.databaseReducer.loggedInUser()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewCardDispatch {
        return {
            deleteViewProfile: (id, initials) => dispatch(ProfileAsyncActionCreator.deleteViewProfile(id, initials)),
            selectViewProfile: id => dispatch(ProfileActionCreator.SelectViewProfile(id)),
            changeViewProfileDescription: (id, description) => dispatch(ProfileActionCreator.ChangeViewProfileDescription(id, description)),
            changeViewProfileName: (id, val) => dispatch(ProfileActionCreator.ChangeViewProfileName(id, val)),
            saveViewProfileChanges:(id, name2, description) => dispatch(ProfileAsyncActionCreator.editViewProfileDetails(id, name2, description)),
            duplicateViewProfile: (id) => dispatch(ProfileAsyncActionCreator.duplicateViewProfile(id))
        };
    }

    private invokeUpdate = () => {
        this.props.saveViewProfileChanges(
            this.props.viewProfileId, this.props.viewProfile.name(), this.props.viewProfile.description());
    };

    private handleToggleNameInputEdit = (disabled: boolean) => {
        this.setState({
            nameInputDisabled: disabled
        });
        if(disabled) this.invokeUpdate();
    };

    private handleToggleDescriptionInput = (disabled: boolean) => {
        this.setState({
            descriptionInputDisabled: disabled
        });
        if(disabled) this.invokeUpdate();
    };

    render() {
        return (
                <div style={{padding:'30px'}}>
                    <div className="row">
                        <div className="col-md-12">
                            <LimitedTextField
                                maxCharacters={50}
                                onChange={(evt, val)=> {this.props.changeViewProfileName(this.props.viewProfileId, val);}}
                                floatingLabelText={PowerLocalize.get('ViewCard.Name')}
                                value={this.props.viewProfile.name()}
                                fullWidth={true}
                                errorText={PowerLocalize.get('ErrorText.InputTooLong')}
                                useToggleEditButton={true}
                                disabled={this.state.nameInputDisabled}
                                onToggleEdit={this.handleToggleNameInputEdit}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <LimitedTextField
                                maxCharacters={255}
                                onChange={(evt, val)=> {this.props.changeViewProfileDescription(this.props.viewProfileId, val);}}
                                floatingLabelText={PowerLocalize.get('ViewCard.Description')}
                                value={this.props.viewProfile.description()}
                                fullWidth={true}
                                errorText={PowerLocalize.get('ErrorText.InputTooLong')}
                                useToggleEditButton={true}
                                disabled={this.state.descriptionInputDisabled}
                                onToggleEdit={this.handleToggleDescriptionInput}
                                multiLine={true}
                            />
                        </div>
                    </div>
                    <h6>
                        {PowerLocalize.get('ViewCard.CreatedOn') + ' '
                        + this.props.viewProfile.creationDate().toLocaleDateString()
                        + ' um '
                        + this.props.viewProfile.creationDate().toLocaleTimeString()}
                    </h6>
                    <div className="row">
                        <div className="col-md-4">
                            <FlatButton
                                label={PowerLocalize.get('Action.Edit')}
                                labelPosition="before"
                                icon={ <FontIcon className="material-icons">edit</FontIcon>}
                                onClick={() => this.props.selectViewProfile(this.props.viewProfileId)}
                            />
                        </div>
                        <div className="col-md-4">
                            <FlatButton
                                label={PowerLocalize.get('Action.Generate')}
                                labelPosition="before"
                                primary={true}
                                icon={ <FontIcon className="material-icons">picture_as_pdf</FontIcon>}
                            />
                        </div>
                        <div className="col-md-4">
                            <IconMenu
                                iconButtonElement={<IconButton><FontIcon className="material-icons">ic_more_vert</FontIcon></IconButton>}
                                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                            >
                                <MenuItem
                                    primaryText={PowerLocalize.get('Action.Delete')}
                                    leftIcon={ <FontIcon className="material-icons">delete</FontIcon>}
                                    onClick={() => this.props.deleteViewProfile(this.props.viewProfileId, this.props.loggedInUser.initials())}
                                />
                                <MenuItem
                                    primaryText={PowerLocalize.get('Action.Duplicate')}
                                    leftIcon={ <FontIcon className="material-icons">content_copy</FontIcon>}
                                    onClick={() => {this.props.duplicateViewProfile(this.props.viewProfileId)}}
                                />
                            </IconMenu>

                        </div>
                    </div>
                </div>
        );
    }
}



/**
 * @see ViewCardModule
 * @author nt
 * @since 23.05.2017
 */
export const ViewCard: React.ComponentClass<ViewCardLocalProps> = connect(ViewCardModule.mapStateToProps, ViewCardModule.mapDispatchToProps)(ViewCardModule);;