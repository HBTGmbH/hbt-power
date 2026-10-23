import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {Avatar, Paper} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import chartIcon from '../../../img/icon_chart.svg';
import {SkillStatisticsLink} from './skill-statistics-link';
import {ThunkDispatch} from 'redux-thunk';
import {APIProfileSkillMetric} from '../../../model/statistics/ApiMetrics';

interface MissingCommonDashboardElementProps {
    profileSkillMetrics: APIProfileSkillMetric;
}

interface MissingCommonDashboardElementLocalProps {
    initials: string;
}

interface MissingCommonDashboardElementLocalState {

}

interface MissingCommonDashboardElementDispatch {
}

class MissingCommonDashboardElementModule extends React.Component<MissingCommonDashboardElementProps & MissingCommonDashboardElementLocalProps & MissingCommonDashboardElementDispatch, MissingCommonDashboardElementLocalState> {

    static mapStateToProps(state: ApplicationState): MissingCommonDashboardElementProps {
        return {
            profileSkillMetrics: state.statisticsReducer.activeProfileMetric,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): MissingCommonDashboardElementDispatch {
        return {
        };
    }



    private renderMissingSkills = () => {
        if (this.props.profileSkillMetrics.missing.length === 0) {
            return PowerLocalize.get('None');
        }
        let missingSkills: String = '';
        let prefix = '';
        this.props.profileSkillMetrics.missing.forEach((com: string) => {
            missingSkills += prefix;
            missingSkills += com;
            prefix = ', ';
        });
        return missingSkills;
    };

    render() {
        if (!this.props.profileSkillMetrics) {
            return <div/>;
        } else {
            return (<Paper className="dashboard-element">
                <div className="vertical-align row">
                    <div className="col-md-3 col-sm-12 col-xs-12 vertical-align">
                        <Avatar sizes={'80'} src={chartIcon}/>
                    </div>
                    <span className="col-md-6 col-xs-12 col-sm-12">
                        {PowerLocalize.get('Dashboard.MissingSkills')} {this.renderMissingSkills()}
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
 * @see MissingCommonDashboardElementModule
 * @author nt
 * @since 27.09.2017
 */
export const MissingCommonDashboardElement = connect(MissingCommonDashboardElementModule.mapStateToProps, MissingCommonDashboardElementModule.mapDispatchToProps)(MissingCommonDashboardElementModule);
