import * as React from 'react';
import {PowerToolbar} from './power-toolbar_module';
import {matchPath, Route, useLocation, useParams} from 'react-router-dom';
import {ViewProfileOverview} from './view/view-profile-overview_module';
import {ConsultantSkillSearch} from '../general/search/consultant-skill-search_module.';
import {SkillStatistics} from './statistics/skill-statistics_module';
import {ClusterResult} from './statistics/cluster-result_module';
import {ConsultantProfile} from './profile/profile_module';
import {PowerOverview} from './power-overview_module';
import {Paths} from '../../Paths';
import {ViewProfilesPage} from './view/view-profiles-page';
import {ReportHistory} from './reportHistory/report_history-module';
import {CrossCuttingAsyncActionCreator} from "../../reducers/crosscutting/CrossCuttingAsyncActionCreator";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {OIDCService} from '../../OIDCService';
import {Alerts} from '../../utils/Alerts';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {navigateReplacing} from '../../reducers/navigation/NavigationActionCreator';
import {ColleaguesPage} from './colleagues/colleagues-page';
import {ColleagueProfileNotice} from './colleagues/colleague-profile-notice';


export const PowerClient = () => {
    const dispatch = useDispatch();
    const {initials} = useParams<{initials: string}>();
    const {pathname} = useLocation();
    const mayOpen = OIDCService.instance().mayOpenProfile(initials);
    // The profile of a colleague is only read (#350): no overview with its profile check, no view profiles, no documents
    const readOnly = mayOpen && !OIDCService.instance().mayEditProfile(initials);
    const offProfile = readOnly && !matchPath(pathname, {path: Paths.USER_PROFILE});
    useEffect(() => {
        if (!mayOpen) {
            // An account without own profile opens none (#255): one message instead of an error from every part of the page
            Alerts.showError(PowerLocalize.getFormatted('ProfileSelect.NotYourProfile', initials));
            navigateReplacing(Paths.START, dispatch);
            return;
        }
        dispatch(CrossCuttingAsyncActionCreator.AsyncLoadProfile(initials, readOnly));
    }, [initials, mayOpen, readOnly, dispatch]);
    useEffect(() => {
        if (offProfile) {
            navigateReplacing(Paths.build(Paths.USER_PROFILE, {initials}), dispatch);
        }
    }, [offProfile, initials, dispatch]);

    if (!mayOpen || offProfile) {
        return null;
    }
    return <div>
        <PowerToolbar/>
        <div style={{marginTop: '70px'}}>
            {readOnly && <ColleagueProfileNotice initials={initials}/>}
            <Route path={Paths.USER_PROFILE} component={ConsultantProfile}/>
            {!readOnly && <>
                <Route path={Paths.USER_HOME} component={PowerOverview}/>
                <Route path={Paths.USER_STATISTICS_CLUSTERINFO} component={ClusterResult}/>
                <Route path={Paths.USER_STATISTICS_SKILLS} component={SkillStatistics}/>
                <Route path={Paths.USER_SEARCH} component={ConsultantSkillSearch}/>
                <Route path={Paths.USER_COLLEAGUES} component={ColleaguesPage}/>
                <Route path={Paths.USER_VIEW_PROFILES} component={ViewProfilesPage}/>
                <Route path={Paths.USER_VIEW_PROFILE} component={ViewProfileOverview}/>
                <Route path={Paths.USER_REPORTS} component={ReportHistory}/>
            </>}
        </div>
    </div>;
}
