import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {
    Card,
    CardActions,
    CardHeader,
    CardText,
    Dialog,
    FontIcon,
    GridList,
    GridTile,
    IconButton,
    RaisedButton,
    TextField
} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from '../../reducers/profile/ProfileAsyncActionCreator';
import {ViewCard} from './view/view-card_module';
import {Profile} from '../../model/Profile';
import {ViewProfile} from '../../model/viewprofile/ViewProfile';
import * as Immutable from 'immutable';
import {ConsultantInfo} from '../../model/ConsultantInfo';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link PowerOverview.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface PowerOverviewProps {
    loggedInUser: ConsultantInfo;
    profile: Profile;
    viewProfiles: Immutable.Map<string, ViewProfile>;
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
    showCreateViewDialog: boolean;
    viewProfileName: string;
    viewProfileDescription: string;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface PowerOverviewDispatch {
    editProfile(initials: string): void;
    createViewProfile(name: string, description: string, initials: string): void;
    refreshViews(initials: string): void;
}

class PowerOverviewModule extends React.Component<
    PowerOverviewProps
    & PowerOverviewLocalProps
    & PowerOverviewDispatch, PowerOverviewLocalState> {



    constructor(props: PowerOverviewProps & PowerOverviewLocalProps & PowerOverviewDispatch) {
        super(props);
        this.state = {
            showCreateViewDialog: false,
            viewProfileName: "" ,
            viewProfileDescription: ""
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: PowerOverviewLocalProps): PowerOverviewProps {
        return {
            loggedInUser: state.databaseReducer.loggedInUser(),
            profile: state.databaseReducer.profile(),
            viewProfiles: state.databaseReducer.viewProfiles()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PowerOverviewDispatch {
        return {
            editProfile: function(initials: string) {
                dispatch(ProfileAsyncActionCreator.editProfile(initials));
            },
            createViewProfile: (name, description, initials) => {
                dispatch(ProfileAsyncActionCreator.createView(initials, name, description))
            },
            refreshViews: (initials) => {
                dispatch(ProfileAsyncActionCreator.getAllViewProfiles(initials))
            }
        }
    }

    private resetLocalState = () => {
        this.setState({
            showCreateViewDialog: false,
            viewProfileName: "",
            viewProfileDescription: ""
        });
    };

    private handleEditButtonClick = () => {
        this.props.editProfile(this.props.loggedInUser.initials());
    };

    private changeViewProfileName(newName: string) {
        this.setState({
            viewProfileName: newName
        });
    }

    private changeViewProfileDescription(newDesc: string) {
        this.setState({
            viewProfileDescription: newDesc
        });
    }

    private showCreateViewDialog = () => {
        this.setState({
            showCreateViewDialog: true
        })
    };

    private exitCreateViewDialog = () => {
        this.resetLocalState();
    };

    private saveViewProfile = () => {
        this.props.createViewProfile(this.state.viewProfileName, this.state.viewProfileDescription,
            this.props.loggedInUser.initials());
        this.exitCreateViewDialog();
    };

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                        <Card>
                            <CardHeader
                                title="Stammdaten"
                                subtitle="Übersicht"
                            />
                            <CardText>
                                <h5>Letzte Aktualisierung:</h5>
                                {this.props.profile.lastEdited().toLocaleString()}
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
                                title="Views"
                                subtitle="Übersicht"
                            />
                            <RaisedButton
                                primary={true}
                                label={PowerLocalize.get('Overview.NewView')}
                                onClick={this.showCreateViewDialog}
                                icon={ <FontIcon className="material-icons">add</FontIcon>}
                                className="margin-5px"
                            />
                            <RaisedButton
                                label={PowerLocalize.get('Overview.RefreshViews')}
                                onClick={() => this.props.refreshViews(this.props.loggedInUser.initials())}
                                icon={ <FontIcon className="material-icons">autorenew</FontIcon>}
                                className="margin-5px"
                            />
                            <Dialog
                                title={PowerLocalize.get('Overview.NewView.Dialog.Title')}
                                open={this.state.showCreateViewDialog}
                            >
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ViewCard.Name')}
                                    value={this.state.viewProfileName}
                                    onChange={(evt, val) => this.changeViewProfileName(val)}
                                />
                                <br/>
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ViewCard.Description')}
                                    value={this.state.viewProfileDescription}
                                    onChange={(evt, val) => this.changeViewProfileDescription(val)}
                                />
                                <br/>
                                <IconButton iconClassName="material-icons"
                                            onClick={this.saveViewProfile}
                                            tooltip={PowerLocalize.get('Action.Save')}>
                                    done
                                </IconButton>
                                <IconButton iconClassName="material-icons"
                                            onClick={this.exitCreateViewDialog}
                                            tooltip={PowerLocalize.get('Action.Undo')}>
                                    undo
                                </IconButton>
                            </Dialog>
                            <GridList cols={3} cellHeight="auto">
                                {
                                    this.props.viewProfiles.map(viewProfile => {
                                        return (
                                            <GridTile cols={1} key={"ViewProfileCard." + viewProfile.id()}>
                                                <ViewCard viewProfileId={viewProfile.id()}/>
                                            </GridTile>
                                                );
                                    }).toArray()
                                }
                            </GridList>
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
export const PowerOverview: React.ComponentClass<PowerOverviewLocalProps> = connect(PowerOverviewModule.mapStateToProps, PowerOverviewModule.mapDispatchToProps)(PowerOverviewModule);;