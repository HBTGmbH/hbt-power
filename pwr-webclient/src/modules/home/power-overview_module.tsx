import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {
    Card,
    CardActions,
    CardHeader,
    CardText,
    FontIcon,
    GridList,
    GridTile,
    RaisedButton,
    Subheader
} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from '../../reducers/singleProfile/ProfileAsyncActionCreator';
import {ViewCard} from '../view/view-card_module';
import {Profile} from '../../model/Profile';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link PowerOverview.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface PowerOverviewProps {
    loggedInInitials: string;
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
    editProfile(initials: string): void;
}

class PowerOverviewModule extends React.Component<
    PowerOverviewProps
    & PowerOverviewLocalProps
    & PowerOverviewDispatch, PowerOverviewLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: PowerOverviewLocalProps): PowerOverviewProps {
        return {
            loggedInInitials: state.databaseReducer.loggedInUser(),
            profile: state.databaseReducer.profile()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PowerOverviewDispatch {
        return {
            editProfile: function(initials: string) {
                dispatch(ProfileAsyncActionCreator.editProfile(initials));
            }
        };
    }

    private handleEditButtonClick = () => {
        this.props.editProfile(this.props.loggedInInitials);
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
                                <Subheader>Letzte Aktualisierung:</Subheader>
                                {this.props.profile.lastEdited().toLocaleDateString()}
                                <Subheader>Aktualisiert von:</Subheader>
                                {this.props.profile.lastEditedBy()}
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
                            <GridList cols={3} cellHeight="auto">
                                <GridTile cols={1}>
                                    <ViewCard/>
                                </GridTile>
                                <GridTile cols={1}>
                                    <ViewCard/>
                                </GridTile>
                                <GridTile cols={1}>
                                    <ViewCard/>
                                </GridTile>
                                <GridTile cols={1}>
                                    <ViewCard/>
                                </GridTile>
                                <GridTile cols={1}>
                                    <ViewCard/>
                                </GridTile>
                                <GridTile cols={1}>
                                    <ViewCard/>
                                </GridTile>
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