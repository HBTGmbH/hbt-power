import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {Avatar, Paper} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';
import {getImagePath} from '../../../API_CONFIG';
import {PwrRaisedButton} from '../../general/pwr-raised-button';
import OpenInNew from '@material-ui/icons/OpenInNew';
import {ThunkDispatch} from 'redux-thunk';
import {APIProfileSkillMetric} from '../../../model/statistics/ApiMetrics';

interface CommonSkillsDashboardElementProps {
    profileSkillMetrics: APIProfileSkillMetric;
}

interface CommonSkillsDashboardElementLocalProps {

}

interface CommonSkillsDashboardElementLocalState {

}

interface CommonSkillsDashboardElementDispatch {
    navigateToStatistics(): void;
}

class CommonSkillsDashboardElementModule extends React.Component<CommonSkillsDashboardElementProps & CommonSkillsDashboardElementLocalProps & CommonSkillsDashboardElementDispatch, CommonSkillsDashboardElementLocalState> {

    static mapStateToProps(state: ApplicationState): CommonSkillsDashboardElementProps {
        return {
            profileSkillMetrics: state.statisticsReducer.activeProfileMetric,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): CommonSkillsDashboardElementDispatch {
        return {
            navigateToStatistics: () => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.USER_STATISTICS_SKILLS)),
        };
    }

    private renderCommonSkills = () => {
        if (this.props.profileSkillMetrics.common.length == 0) {
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
                        <Avatar sizes={'80'} src={getImagePath() + '/statistics_icon.svg'}/>
                    </div>
                    <span className="col-md-6 col-xs-12 col-sm-12">
                    Standard-Skills, die auch in diesem Profil vorhanden sind:{this.renderCommonSkills()}
                </span>
                    <div className="col-md-3 col-sm-12">
                        <PwrRaisedButton color={'primary'} icon={<OpenInNew/>}
                                         text={PowerLocalize.get('Action.ShowMore')}
                                         onClick={this.props.navigateToStatistics}/>
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
