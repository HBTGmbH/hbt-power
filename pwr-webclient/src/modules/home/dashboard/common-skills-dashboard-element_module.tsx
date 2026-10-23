import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {Avatar, Paper} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import statisticsIcon from '../../../img/statistics_icon.svg';
import {SkillStatisticsLink} from './skill-statistics-link';
import {ThunkDispatch} from 'redux-thunk';
import {APIProfileSkillMetric} from '../../../model/statistics/ApiMetrics';

interface CommonSkillsDashboardElementProps {
    profileSkillMetrics: APIProfileSkillMetric;
}

interface CommonSkillsDashboardElementLocalProps {
    initials: string;
}

interface CommonSkillsDashboardElementLocalState {

}

interface CommonSkillsDashboardElementDispatch {
}

class CommonSkillsDashboardElementModule extends React.Component<CommonSkillsDashboardElementProps & CommonSkillsDashboardElementLocalProps & CommonSkillsDashboardElementDispatch, CommonSkillsDashboardElementLocalState> {

    static mapStateToProps(state: ApplicationState): CommonSkillsDashboardElementProps {
        return {
            profileSkillMetrics: state.statisticsReducer.activeProfileMetric,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): CommonSkillsDashboardElementDispatch {
        return {
        };
    }


    private renderCommonSkills = () => {
        if (this.props.profileSkillMetrics.common.length === 0) {
            return PowerLocalize.get('None');
        }
        let commonSkills: String = '';
        let prefix = '';
        this.props.profileSkillMetrics.common.forEach(com => {
            commonSkills += prefix;
            commonSkills += com;
            prefix = ', ';
        });
        return commonSkills;
    };

    render() {
        if (!this.props.profileSkillMetrics) {
            return <div/>;
        } else {
            return (<Paper className="dashboard-element">
                <div className="vertical-align row">
                    <div className="col-md-3 col-sm-12 col-xs-12 vertical-align">
                        <Avatar sizes={'80'} src={statisticsIcon}/>
                    </div>
                    <span className="col-md-6 col-xs-12 col-sm-12">
                    {PowerLocalize.get('Dashboard.CommonSkills')} {this.renderCommonSkills()}
                </span>
                    <div className="col-md-3 col-sm-12">
                        <SkillStatisticsLink initials={this.props.initials}/>
                    </div>
                </div>
            </Paper>);
        }
    }
}

/**
 * @see CommonSkillsDashboardElementModule
 * @author nt
 * @since 27.09.2017
 */
export const CommonSkillsDashboardElement = connect(CommonSkillsDashboardElementModule.mapStateToProps, CommonSkillsDashboardElementModule.mapDispatchToProps)(CommonSkillsDashboardElementModule);
