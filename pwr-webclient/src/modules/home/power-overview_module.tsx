import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Card, CardActions, CardHeader, CardText, FlatButton, FontIcon, RaisedButton} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from '../../reducers/profile/ProfileAsyncActionCreator';
import {Profile} from '../../model/Profile';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {ProfileStatistics} from './profile-statistics_module';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../Paths';
import {ApplicationState} from '../../reducers/reducerIndex';
import {ViewProfile} from '../../model/view/ViewProfile';
import {ViewCard} from './view/view-card_module';
import {ViewProfileActionCreator} from '../../reducers/view/ViewProfileActionCreator';
import {ViewProfileDialog} from './view/view-profile-dialog_module';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link PowerOverview.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface PowerOverviewProps {
    loggedInUser: ConsultantInfo;
    profile: Profile;
    viewProfiles: Array<ViewProfile>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link PowerOverviewProps} and will then be
 * managed by redux.
 */
interface PowerOverviewLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface PowerOverviewLocalState {
    createViewDialogOpen: boolean;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface PowerOverviewDispatch {
    requestSingleProfile(initials: string): void;
    navigateTo(target: string): void;
    createViewProfile(description: string, name: string): void;

}

class PowerOverviewModule extends React.Component<
    PowerOverviewProps
    & PowerOverviewLocalProps
    & PowerOverviewDispatch, PowerOverviewLocalState> {



    constructor(props: PowerOverviewProps & PowerOverviewLocalProps & PowerOverviewDispatch) {
        super(props);
        this.resetLocalState();
    }

    static mapStateToProps(state: ApplicationState, localProps: PowerOverviewLocalProps): PowerOverviewProps {
        return {
            loggedInUser: state.databaseReducer.loggedInUser(),
            profile: state.databaseReducer.profile(),
            viewProfiles: state.viewProfileSlice.viewProfiles().toArray()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PowerOverviewDispatch {
        return {
            requestSingleProfile: function(initials: string) {
                dispatch(ProfileAsyncActionCreator.requestSingleProfile(initials));
            },
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            createViewProfile: (description, name) => dispatch(ViewProfileActionCreator.AsyncCreateViewProfile(description, name)),
        }
    }

    private setViewDialogOpen(isOpen: boolean) {
        this.setState({
            createViewDialogOpen: isOpen
        })
    }

    private resetLocalState = () => {
        this.state = {
            createViewDialogOpen: false
        }
    };

    private handleEditButtonClick = () => {
        this.props.requestSingleProfile(this.props.loggedInUser.initials());
        this.props.navigateTo(Paths.USER_PROFILE);
    };

    private handleCreateViewProfile = (name: string, description: string) => {
        this.props.createViewProfile(name, description);
        this.setViewDialogOpen(false);
    };


    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                        <Card>
                            <CardText>
                                <h3>{PowerLocalize.get("Overview.Base.BaseData")}</h3>
                            </CardText>
                            <CardText>
                                <h4>{PowerLocalize.get("Overview.Base.LastEdited")}</h4>
                                {this.props.profile.lastEdited().toLocaleString()}
                            </CardText>
                            <CardText>
                                <ProfileStatistics/>
                            </CardText>
                            <CardActions>
                                <RaisedButton
                                    label={PowerLocalize.get('Action.Edit')}
                                    labelPosition="before"
                                    primary={true}
                                    icon={ <FontIcon className="material-icons">edit</FontIcon>}
                                    onClick={this.handleEditButtonClick}
                                />
                            </CardActions>
                        </Card>
                        <br/>

                        <Card>
                            <CardHeader
                                title={PowerLocalize.get("Overview.ViewProfiles.Title")}
                                subtitle={PowerLocalize.get("Overview.ViewProfiles.Subtitle")}
                            />
                            <ViewProfileDialog
                                onRequestClose={() => this.setViewDialogOpen(false)}
                                open={this.state.createViewDialogOpen}
                                onSave={this.handleCreateViewProfile}
                                type="new"
                            />
                            <FlatButton
                                label={PowerLocalize.get("ViewProfile.Create")}
                                onTouchTap={() => this.setViewDialogOpen(true)}
                            />
                            <div className="row">
                               {this.props.viewProfiles.map(viewProfile => {
                                   return <div className="col-md-4" key={viewProfile.id}>
                                       <ViewCard viewProfileId={viewProfile.id}/>
                                   </div>
                               })}
                            </div>
                        </Card>
                </div>
            </div>
            );
    }
}

/**
 * @see PowerOverviewModule
 * @author nt
 * @since 22.05.2017
 */
export const PowerOverview: React.ComponentClass<PowerOverviewLocalProps> = connect(PowerOverviewModule.mapStateToProps, PowerOverviewModule.mapDispatchToProps)(PowerOverviewModule);