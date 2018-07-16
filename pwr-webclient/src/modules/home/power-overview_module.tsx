import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Icon, Paper, Button} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from '../../reducers/profile/ProfileAsyncActionCreator';
import {Profile} from '../../model/Profile';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {ProfileStatistics} from './profile-statistics_module';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {ApplicationState} from '../../reducers/reducerIndex';
import {ViewProfile} from '../../model/view/ViewProfile';
import {ViewCard} from './view/view-card_module';
import {ViewProfileActionCreator} from '../../reducers/view/ViewProfileActionCreator';
import {ViewProfileDialog} from './view/view-profile-dialog_module';
import {BaseDataDashboardElement} from './dashboard/base-data-dahboard-element_module';
import {CommonSkillsDashboardElement} from './dashboard/common-skills-dashboard-element_module';
import {MissingCommonDashboardElement} from './dashboard/missing-common-dashboard-element';

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
        };
    }

    private setViewDialogOpen(isOpen: boolean) {
        this.setState({
            createViewDialogOpen: isOpen
        });
    }

    private resetLocalState = () => {
        this.state = {
            createViewDialogOpen: false
        };
    };



    private handleCreateViewProfile = (name: string, description: string) => {
        this.props.createViewProfile(name, description);
        this.setViewDialogOpen(false);
    };


    render() {
        return (
            <div className="row">
                <div className="col-md-5 col-md-offset-1">
                    <div className="row">
                        <div className="col-md-12">
                            <BaseDataDashboardElement/>
                        </div>
                        <div className="col-md-12">
                            <CommonSkillsDashboardElement/>
                        </div>
                        <div className="col-md-12">
                            <MissingCommonDashboardElement/>
                        </div>
                        <div className="col-md-12 fullWidth">
                            <ProfileStatistics/>
                        </div>
                    </div>
                </div>
                <div className="col-md-5">
                    <div className="row">
                        <div className="col-md-12">
                            <Paper className="dashboard-element">
                                <div className="mui-margin">
                                    <span style={{fontSize: "16px", fontWeight: "bold"}}>{PowerLocalize.get('Overview.ViewProfiles.Title')}</span><br/>
                                </div>
                                <div className="mui-margin">
                                    <span>{PowerLocalize.get('Overview.ViewProfiles.Description')}</span>
                                </div>
                                <ViewProfileDialog
                                    onClose={() => this.setViewDialogOpen(false)}
                                    open={this.state.createViewDialogOpen}
                                    onSave={this.handleCreateViewProfile}
                                    type="new"
                                />
                                <Button
                                    variant={'raised'}
                                    color={'primary'}
                                    className="mui-margin"
                                    label={PowerLocalize.get('ViewProfile.Create')}
                                    onClick={() => this.setViewDialogOpen(true)}
                                    icon={<Icon className="material-icons">add</Icon>}
                                />
                                <div className="row">
                                    {this.props.viewProfiles.map(viewProfile => {
                                        return <div className="col-md-12 fullWidth" style={{marginTop: "8px"}} key={viewProfile.id}>
                                            <ViewCard viewProfileId={viewProfile.id}/>
                                        </div>;
                                    })}
                                </div>
                            </Paper>
                        </div>
                    </div>
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