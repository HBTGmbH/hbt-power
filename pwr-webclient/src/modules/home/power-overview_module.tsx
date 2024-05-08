import {connect} from 'react-redux';
import * as React from 'react';
import {Paper} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
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
import {ProfileDataAsyncActionCreator} from '../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {Consultant} from '../../reducers/profile-new/consultant/model/Consultant';
import {getRandomGreeting} from '../../model/PwrConstants';
import {Paths} from '../../Paths';
import {PwrRaisedButton} from '../general/pwr-raised-button';
import Add from '@material-ui/icons/Add';
import {ThunkDispatch} from 'redux-thunk';
import {withRouter} from 'react-router-dom';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link PowerOverview.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface PowerOverviewProps {
    loggedInUser: Consultant;
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
    match?: any; // from react-router
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface PowerOverviewLocalState {
    createViewDialogOpen: boolean;
    greeting: string;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface PowerOverviewDispatch {
    requestSingleProfile(initials: string): void;

    navigateTo(target: string): void;

    createViewProfile(description: string, name: string): void;

}

class PowerOverviewModule extends React.Component<PowerOverviewProps
    & PowerOverviewLocalProps
    & PowerOverviewDispatch, PowerOverviewLocalState> {


    constructor(props: PowerOverviewProps & PowerOverviewLocalProps & PowerOverviewDispatch) {
        super(props);
        this.resetLocalState();
    }

    static mapStateToProps(state: ApplicationState): PowerOverviewProps {
        return {
            loggedInUser: state.profileStore.consultant,
            viewProfiles: state.viewProfileSlice.viewProfiles.toArray()
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): PowerOverviewDispatch {
        return {
            requestSingleProfile: function (initials: string) {
                dispatch(ProfileDataAsyncActionCreator.loadFullProfile(initials));
            },
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            createViewProfile: (description, name) => dispatch(ViewProfileActionCreator.AsyncCreateViewProfile(description, name)),
        };
    }

    componentDidMount() {
    }

    private setViewDialogOpen(isOpen: boolean) {
        this.setState({
            createViewDialogOpen: isOpen
        });
    }

    private resetLocalState = () => {
        this.state = {
            createViewDialogOpen: false,
            greeting: getRandomGreeting()
        };
    };


    private handleCreateViewProfile = (name: string, description: string) => {
        this.props.createViewProfile(name, description);
        this.setViewDialogOpen(false);
    };


    render() {
        const initials = this.props.match.params.initials;
        return (
            <div>
                <div className="col-md-5 col-md-offset-1">
                    <div className="row">
                        <div className="col-md-12">
                            <BaseDataDashboardElement greeting={this.state.greeting}/>
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
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}>{PowerLocalize.get('Overview.ViewProfiles.Title')}</span><br/>
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
                                <div className={'col-md-6'}>
                                    <PwrRaisedButton color={'primary'} onClick={() => this.setViewDialogOpen(true)}
                                                     icon={<Add/>} text={PowerLocalize.get('ViewProfile.Create')}/>
                                </div>
                                <div className={'col-md-6'}>
                                    <PwrRaisedButton color={'primary'}
                                                     onClick={() => this.props.navigateTo(Paths.build(Paths.USER_REPORTS, {initials}))}
                                                     icon={<></>} text={PowerLocalize.get('Report.History')}/>
                                </div>
                                <div className="row">
                                    {this.props.viewProfiles.map(viewProfile => {
                                        return <div className="col-md-12 fullWidth" style={{marginTop: '8px'}}
                                                    key={viewProfile.id}>
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

const WithRouterComponent = withRouter(props => <PowerOverviewModule {...props}/>);

/**
 * @see PowerOverviewModule
 * @author nt
 * @since 22.05.2017
 */
export const PowerOverview = connect(PowerOverviewModule.mapStateToProps, PowerOverviewModule.mapDispatchToProps)(WithRouterComponent);
