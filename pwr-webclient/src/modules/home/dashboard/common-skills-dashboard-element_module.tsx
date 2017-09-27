import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {Avatar, FontIcon, Paper, RaisedButton} from 'material-ui';
import {ProfileSkillMetrics} from '../../../model/statistics/ProfileSkillMetrics';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {StatisticsActionCreator} from '../../../reducers/statistics/StatisticsActionCreator';
import {Paths} from '../../../Paths';

interface CommonSkillsDashboardElementProps {
    profileSkillMetrics: ProfileSkillMetrics;
}

interface CommonSkillsDashboardElementLocalProps {

}

interface CommonSkillsDashboardElementLocalState {

}

interface CommonSkillsDashboardElementDispatch {
    navigateTo(target: string): void;
    loadSkillStatistics(): void;
}

class CommonSkillsDashboardElementModule extends React.Component<CommonSkillsDashboardElementProps & CommonSkillsDashboardElementLocalProps & CommonSkillsDashboardElementDispatch, CommonSkillsDashboardElementLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: CommonSkillsDashboardElementLocalProps): CommonSkillsDashboardElementProps {
        return {
            profileSkillMetrics: state.statisticsReducer.activeProfileMetric(),
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): CommonSkillsDashboardElementDispatch {
        return {
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            loadSkillStatistics: () => dispatch(StatisticsActionCreator.AsyncRequestSkillUsages())
        }
    }

    private loadSkillStatistics = () => {
        // FIXME move this into the async action.
        this.props.loadSkillStatistics();
        this.props.navigateTo(Paths.USER_STATISTICS_SKILLS);
    };

    private renderCommonSkills = () => {
        if(this.props.profileSkillMetrics.commonSkills().size == 0) {
            return PowerLocalize.get('None');
        }
        let commonSkills: String = '';
        let prefix = '';
        this.props.profileSkillMetrics.commonSkills().forEach(com => {
            commonSkills += prefix;
            commonSkills += com;
            prefix = ' ,';
        });
        return commonSkills;
    };

    render() {
        if(isNullOrUndefined(this.props.profileSkillMetrics)){
            return <div/>;
        } else {
            return (<Paper className="dashboard-element">
                <div className="vertical-align row">
                    <div className="col-md-3 col-sm-12 col-xs-12 vertical-align">
                        <Avatar  size={80} src={"/img/statistics_icon.svg"} />
                    </div>
                    <span className="col-md-6 col-xs-12 col-sm-12">
                    Standard-Skills, die auch in diesem Profil vorhanden sind:{this.renderCommonSkills()}
                </span>
                    <div className="col-md-3 col-sm-12">
                        <RaisedButton
                            style={{marginTop: "8px"}}
                            label={PowerLocalize.get('Action.ShowMore')}
                            labelPosition="before"
                            primary={true}
                            icon={ <FontIcon className="material-icons">open_in_new</FontIcon>}
                            onTouchTap={() => this.loadSkillStatistics()}
                        />
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
export const CommonSkillsDashboardElement: React.ComponentClass<CommonSkillsDashboardElementLocalProps> = connect(CommonSkillsDashboardElementModule.mapStateToProps, CommonSkillsDashboardElementModule.mapDispatchToProps)(CommonSkillsDashboardElementModule);