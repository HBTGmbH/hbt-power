import * as React from 'react';
import {PowerToolbar} from './power-toolbar_module';
import {ProfileLoadingSpinner} from './profile/profile-loading-spinner_module';
import {Route} from 'react-router-dom';
import {ViewProfileOverview} from './view/view-profile-overview_module';
import {ConsultantSkillSearch} from '../general/search/consultant-skill-search_module.';
import {SkillStatistics} from './statistics/skill-statistics_module';
import {ClusterResult} from './statistics/cluster-result_module';
import {ProfileNetworkGraph} from '../general/statistics/profile-network_module';
import {ConsultantProfile} from './profile/profile_module';
import {PowerOverview} from './power-overview_module';
import {Paths} from '../../Paths';
import {ReportHistory} from './reportHistory/report_history-module';


export class PowerClient extends React.Component<{}, {}> {
    render() {
        return <div>
            <PowerToolbar/>
            <div style={{marginTop: '70px'}}>
                <Route path={Paths.USER_HOME} component={PowerOverview}/>
                <Route path={Paths.USER_PROFILE} component={ConsultantProfile}/>
                <Route path={Paths.USER_STATISTICS_NETWORK} component={ProfileNetworkGraph}/>
                <Route path={Paths.USER_STATISTICS_CLUSTERINFO} component={ClusterResult}/>
                <Route path={Paths.USER_STATISTICS_SKILLS} component={SkillStatistics}/>
                <Route path={Paths.USER_SEARCH} component={ConsultantSkillSearch}/>
                <Route path={Paths.USER_VIEW_PROFILE} component={ViewProfileOverview}/>
                <Route path={Paths.USER_REPORTS} component={ReportHistory} />
            </div>
            <ProfileLoadingSpinner/>
        </div>;
    }
}
