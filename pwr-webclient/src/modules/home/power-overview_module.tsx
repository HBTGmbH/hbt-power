import {connect} from 'react-redux';
import * as React from 'react';
import {Paper} from '@material-ui/core';
import {ProfileStatistics} from './profile-statistics_module';
import {ApplicationState} from '../../reducers/reducerIndex';
import {ViewProfileSection} from './view/view-profile-section';
import {BaseDataDashboardElement} from './dashboard/base-data-dahboard-element_module';
import {CommonSkillsDashboardElement} from './dashboard/common-skills-dashboard-element_module';
import {MissingCommonDashboardElement} from './dashboard/missing-common-dashboard-element';
import {ProfileCheckDashboardElement} from './dashboard/profile-check-dashboard-element';
import {ProfileDataAsyncActionCreator} from '../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {Consultant} from '../../reducers/profile-new/consultant/model/Consultant';
import {getRandomGreeting} from '../../model/PwrConstants';
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
    greeting: string;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface PowerOverviewDispatch {
    requestSingleProfile(initials: string): void;
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
            loggedInUser: state.profileStore.consultant
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): PowerOverviewDispatch {
        return {
            requestSingleProfile: function (initials: string) {
                dispatch(ProfileDataAsyncActionCreator.loadFullProfile(initials));
            },
        };
    }

    componentDidMount() {
        this.props.requestSingleProfile(this.props.match.params.initials);
    }

    componentDidUpdate(prevProps: Readonly<PowerOverviewProps & PowerOverviewLocalProps & PowerOverviewDispatch>) {
        // Switching the consultant keeps this component mounted
        if (prevProps.match.params.initials !== this.props.match.params.initials) {
            this.props.requestSingleProfile(this.props.match.params.initials);
        }
    }

    private resetLocalState = () => {
        this.state = {
            greeting: getRandomGreeting()
        };
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
                        {/* Right after the welcome: what is missing or outdated (#139) */}
                        <div className="col-md-12">
                            <ProfileCheckDashboardElement initials={initials}/>
                        </div>
                        <div className="col-md-12">
                            <CommonSkillsDashboardElement initials={initials}/>
                        </div>
                        <div className="col-md-12">
                            <MissingCommonDashboardElement initials={initials}/>
                        </div>
                        <div className="col-md-12 fullWidth">
                            <ProfileStatistics initials={initials}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-5">
                    <div className="row">
                        <div className="col-md-12">
                            <Paper className="dashboard-element">
                                <div className="mui-margin">
                                    {/* The newest three, all on a page of their own (#213) */}
                                    <ViewProfileSection initials={initials} limit={3}/>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const WithRouterComponent = withRouter((props: any) => <PowerOverviewModule {...props}/>);

/**
 * @see PowerOverviewModule
 * @author nt
 * @since 22.05.2017
 */
export const PowerOverview = connect(PowerOverviewModule.mapStateToProps, PowerOverviewModule.mapDispatchToProps)(WithRouterComponent);
