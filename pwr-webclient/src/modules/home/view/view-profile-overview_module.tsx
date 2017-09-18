import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {isNullOrUndefined} from 'util';
import {Dialog, Tab, Tabs} from 'material-ui';
import {ViewProfileEntriesOverview} from './view-profile-entries-overview_module';
import {ViewProfileProjectsOverview} from './view-profile-projects-overview_module';
import {ViewProfileSkillOverview} from './view-profile-skill-overview_module';

interface ViewProfileOverviewProps {
    viewProfile: ViewProfile;
    isInProgress: boolean;
}


interface ViewProfileOverviewLocalProps {
    params?: any;
}

interface ViewProfileOverviewLocalState {

}

interface ViewProfileOverviewDispatch {
}

class ViewProfileOverviewModule extends React.Component<
    ViewProfileOverviewProps
    & ViewProfileOverviewLocalProps
    & ViewProfileOverviewDispatch, ViewProfileOverviewLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileOverviewLocalProps): ViewProfileOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.params.id),
            isInProgress: state.viewProfileSlice.sortInProgress()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewProfileOverviewDispatch {
        return {

        };
    }


    render() {
        if (isNullOrUndefined(this.props.viewProfile)) {
            return <div>Does not exist</div>;
        } else {
            let viewProfileId = this.props.params.id;
            return (<div>
                <Dialog
                    open={this.props.isInProgress}
                    contentStyle={{color: 'rgb(255, 255, 255, 0)', opacity: 0}}
                    overlayStyle={{backgroundColor: 'rgba(0, 0, 0, 0.4)'}}
                    modal={true}
                >
                    <span style={{color: 'white', opacity: 1}}>Loading...</span>
                </Dialog>
                This is View Profile id = {viewProfileId}
                <Tabs>
                    <Tab label="Entries">
                        <ViewProfileEntriesOverview
                            viewProfileId={viewProfileId}
                        />
                    </Tab>
                    <Tab label="Projects">
                        <ViewProfileProjectsOverview
                            viewProfileId={viewProfileId}
                        />
                    </Tab>
                    <Tab label="Skills">
                        <ViewProfileSkillOverview
                            viewProfileId={viewProfileId}
                        />
                    </Tab>
                </Tabs>
            </div>);
        }
    }
}

/**
 * @see ViewProfileOverviewModule
 * @author nt
 * @since 11.09.2017
 */
export const ViewProfileOverview: React.ComponentClass<ViewProfileOverviewLocalProps> = connect(ViewProfileOverviewModule.mapStateToProps, ViewProfileOverviewModule.mapDispatchToProps)(ViewProfileOverviewModule);