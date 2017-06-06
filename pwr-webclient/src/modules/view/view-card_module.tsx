import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {FlatButton, FontIcon, Paper, TextField, Subheader} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ViewProfile} from '../../model/viewprofile/ViewProfile';
import {ProfileActionCreator} from '../../reducers/profile/ProfileActionCreator';
import {ProfileAsyncActionCreator} from '../../reducers/profile/ProfileAsyncActionCreator';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ViewCard.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ViewCardProps {
    viewProfile: ViewProfile;
    loggedInInitials: string;
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

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ViewCardDispatch {
    deleteViewProfile(id: string, initials: string): void;
    selectViewProfile(id: string): void;
}

class ViewCardModule extends React.Component<ViewCardProps & ViewCardLocalProps & ViewCardDispatch, ViewCardLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewCardLocalProps): ViewCardProps {
        return {
            viewProfile: state.databaseReducer.viewProfiles().get(localProps.viewProfileId),
            loggedInInitials: state.databaseReducer.loggedInUser()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewCardDispatch {
        return {
            deleteViewProfile: (id, initials) => dispatch(ProfileAsyncActionCreator.deleteViewProfile(id, initials)),
            selectViewProfile: id => dispatch(ProfileActionCreator.SelectViewProfile(id))
        };
    }

    render() {
        return (
            <Paper zDepth={3}>
                <div style={{padding:'30px'}}>
                    <div className="row">
                        <div className="col-md-12">
                            <h4>{PowerLocalize.get('ViewCard.Name')}</h4> {this.props.viewProfile.name()}
                            <br/>
                            <Subheader>{PowerLocalize.get('ViewCard.CreatedOn') + " " + this.props.viewProfile.creationDate()}</Subheader>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <h4>{PowerLocalize.get('ViewCard.Description')}</h4> {this.props.viewProfile.description()}
                        </div>
                    </div>

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
                            <FlatButton
                                label={PowerLocalize.get('Action.Delete')}
                                labelPosition="before"
                                secondary={true}
                                icon={ <FontIcon className="material-icons">delete</FontIcon>}
                                onClick={() => this.props.deleteViewProfile(this.props.viewProfileId, this.props.loggedInInitials)}
                            />
                        </div>
                    </div>
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
export const ViewCard: React.ComponentClass<ViewCardLocalProps> = connect(ViewCardModule.mapStateToProps, ViewCardModule.mapDispatchToProps)(ViewCardModule);