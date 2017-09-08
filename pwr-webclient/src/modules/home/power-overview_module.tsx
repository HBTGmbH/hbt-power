import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {Card, CardActions, CardHeader, CardText, FontIcon, RaisedButton} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from '../../reducers/profile/ProfileAsyncActionCreator';
import {Profile} from '../../model/Profile';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {ProfileStatistics} from './profile-statistics_module';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../Paths';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link PowerOverview.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface PowerOverviewProps {
    loggedInUser: ConsultantInfo;
    profile: Profile;
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
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface PowerOverviewDispatch {
    requestSingleProfile(initials: string): void;
    navigateTo(target: string): void;
}

class PowerOverviewModule extends React.Component<
    PowerOverviewProps
    & PowerOverviewLocalProps
    & PowerOverviewDispatch, PowerOverviewLocalState> {



    constructor(props: PowerOverviewProps & PowerOverviewLocalProps & PowerOverviewDispatch) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: PowerOverviewLocalProps): PowerOverviewProps {
        return {
            loggedInUser: state.databaseReducer.loggedInUser(),
            profile: state.databaseReducer.profile(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PowerOverviewDispatch {
        return {
            requestSingleProfile: function(initials: string) {
                dispatch(ProfileAsyncActionCreator.requestSingleProfile(initials));
            },
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target))
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
        this.props.requestSingleProfile(this.props.loggedInUser.initials());
        this.props.navigateTo(Paths.USER_PROFILE);
    };


    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                        <Card>
                            <CardText>
                                <h3>Stammdaten</h3>
                            </CardText>
                            <CardText>
                                <h4>Letzte Aktualisierung:</h4>
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
                                title="Views"
                                subtitle="Übersicht"
                            />
                            TODO
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