import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {FontIcon, IconButton, IconMenu, Paper, RaisedButton} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfile} from '../../../model/viewprofile/ViewProfile';
import {ProfileActionCreator} from '../../../reducers/profile/ProfileActionCreator';
import {ProfileAsyncActionCreator} from '../../../reducers/profile/ProfileAsyncActionCreator';
import {LimitedTextField} from '../../general/limited-text-field-module.';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';


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
    charsPerLineDisabled: boolean;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ViewCardDispatch {
    deleteViewProfile(id: string, initials: string): void;
    selectViewProfile(id: string): void;
    changeViewProfileName(id: string, val: string): void;
    changeViewProfileDescription(id: string, description: string): void;
    changeViewProfileCharsPerLine(id: string, charsPerLine: number): void;
    saveViewProfileChanges(id: string, name: string, description: string, charsPerLine: number): void;
    duplicateViewProfile(id: string): void;
    generatePdf(initials: string, viewProfileId: string): void;
    generateDocX(initials: string, viewProfileId: string): void;
}

class ViewCardModule extends React.Component<ViewCardProps & ViewCardLocalProps & ViewCardDispatch, ViewCardLocalState> {

    constructor(props: ViewCardProps & ViewCardLocalProps & ViewCardDispatch) {
        super(props);
        this.state = {
            nameInputDisabled: true,
            descriptionInputDisabled: true,
            charsPerLineDisabled: true
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
            changeViewProfileCharsPerLine: (id, charsPerLine) => dispatch(ProfileActionCreator.ChangeViewProfileCharsPerLine(id, charsPerLine)),
            changeViewProfileName: (id, val) => dispatch(ProfileActionCreator.ChangeViewProfileName(id, val)),
            saveViewProfileChanges:(id, name2, description, charsPerLine) => dispatch(ProfileAsyncActionCreator.editViewProfileDetails(id, name2, description, charsPerLine)),
            duplicateViewProfile: (id) => dispatch(ProfileAsyncActionCreator.duplicateViewProfile(id)),
            generatePdf: (initials, id) => dispatch(ProfileAsyncActionCreator.generatePDFProfile(initials, id)),
            generateDocX: (initials, id) => dispatch(ProfileAsyncActionCreator.generateDocXProfile(initials, id))
        };
    }

    private invokeUpdate = () => {
        this.props.saveViewProfileChanges(
            this.props.viewProfileId,
            this.props.viewProfile.name(),
            this.props.viewProfile.description(),
            this.props.viewProfile.descriptionCharsPerLine()
        );
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

    private handleCharsPerLineToggle = (disabled: boolean) => {
        this.setState({
            charsPerLineDisabled: disabled
        });
        if(disabled) this.invokeUpdate();
    };

    private handleChangeCharsPerLine = (e: any, v: string) => {
        if(v.trim() == "") {
            this.props.changeViewProfileCharsPerLine(this.props.viewProfileId, 0);
        } else {
            const num = Number.parseInt(v);
            if(!isNullOrUndefined(num) && !isNaN(num)) {
                this.props.changeViewProfileCharsPerLine(this.props.viewProfileId, num);
            }
        }

    };

    private invokePDFGeneration = () => {
        this.props.generatePdf(this.props.loggedInUser.initials(), this.props.viewProfileId);
    };

    private invokeDocXGeneration = () => {
        this.props.generateDocX(this.props.loggedInUser.initials(), this.props.viewProfileId);
    };

    render() {
        return (
            <Paper style={{padding:'30px'}}>
                <div className="fullWidth">
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
                <div className="fullWidth">
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
                <div className="fullWidth">
                    <LimitedTextField
                        maxCharacters={2}
                        onChange={this.handleChangeCharsPerLine}
                        floatingLabelText={"Chars per Line"}
                        value={this.props.viewProfile.descriptionCharsPerLine().toString()}
                        fullWidth={true}
                        errorText={PowerLocalize.get('ErrorText.InputTooLong')}
                        useToggleEditButton={true}
                        disabled={this.state.charsPerLineDisabled}
                        onToggleEdit={this.handleCharsPerLineToggle}
                    />
                </div>
                <h6>
                    {PowerLocalize.get('ViewCard.CreatedOn') + ' '
                    + this.props.viewProfile.creationDate().toLocaleDateString()
                    + ' um '
                    + this.props.viewProfile.creationDate().toLocaleTimeString()}
                </h6>
                <div className="vcenter">
                    <RaisedButton
                        className="margin-5px"
                        label={PowerLocalize.get('Action.Edit')}
                        labelPosition="before"
                        icon={ <FontIcon className="material-icons">edit</FontIcon>}
                        onClick={() => this.props.selectViewProfile(this.props.viewProfileId)}
                    />
                </div>
                <IconMenu
                    iconButtonElement={<IconButton iconClassName="material-icons">more</IconButton>}
                    anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                >
                    <RaisedButton
                        className="margin-5px"
                        label={PowerLocalize.get('Action.Delete')}
                        labelPosition="before"
                        secondary={true}
                        icon={ <FontIcon className="material-icons">delete</FontIcon>}
                        onClick={() => this.props.deleteViewProfile(this.props.viewProfileId, this.props.loggedInUser.initials())}
                    />
                    <RaisedButton
                        className="margin-5px"
                        label={PowerLocalize.get('Action.Duplicate')}
                        labelPosition="before"
                        primary={true}
                        icon={ <FontIcon className="material-icons">content_copy</FontIcon>}
                        onClick={() => {this.props.duplicateViewProfile(this.props.viewProfileId);}}
                    />
                </IconMenu>
                <div className="vcenter">
                    <RaisedButton
                        className="margin-5px"
                        label={PowerLocalize.get('Action.Generate.PDF')}
                        labelPosition="before"
                        primary={true}
                        icon={ <FontIcon className="material-icons">picture_as_pdf</FontIcon>}
                        onClick={this.invokePDFGeneration}
                    />
                    <RaisedButton
                        className="margin-5px"
                        label={PowerLocalize.get('Action.Generate.Word')}
                        labelPosition="before"
                        primary={true}
                        icon={ <FontIcon className="material-icons">open_in_new</FontIcon>}
                        onClick={this.invokeDocXGeneration}
                    />

                </div>
            </Paper>
        );
    }
}



/**
 * @see ViewCardModule
 * @author nt
 * @since 23.05.2017
 */
export const ViewCard: React.ComponentClass<ViewCardLocalProps> = connect(ViewCardModule.mapStateToProps, ViewCardModule.mapDispatchToProps)(ViewCardModule);;