import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {isNullOrUndefined} from 'util';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Profile} from '../../model/Profile';
import {NoStatisticsAvailable} from '../general/statistics/no-statistics-available_module.';
import {ApplicationState} from '../../reducers/reducerIndex';
import {Paper} from 'material-ui';

const Recharts = require('recharts');

interface ProfileStatisticsProps {
    profileSkillMetrics: ProfileSkillMetrics;
    profile: Profile;
    available: boolean;
}

interface ProfileStatisticsLocalProps {

}

interface ProfileStatisticsLocalState {

}

interface ProfileStatisticsDispatch {

}

class ProfileStatisticsModule extends React.Component<
    ProfileStatisticsProps
    & ProfileStatisticsLocalProps
    & ProfileStatisticsDispatch, ProfileStatisticsLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProfileStatisticsLocalProps): ProfileStatisticsProps {
        return {
            profileSkillMetrics: state.statisticsReducer.activeProfileMetric(),
            profile: state.databaseReducer.profile(),
            available: state.statisticsReducer.available()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileStatisticsDispatch {
        return {};
    }



    private renderElementCounts = () => {
        let langCount = this.props.profile.languageSkills().count();
        let secCount = this.props.profile.sectorEntries().count();
        let qualCount = this.props.profile.qualificationEntries().count();
        let edCount = this.props.profile.educationEntries().count();
        let trainCount = this.props.profile.trainingEntries().count();
        let careerCount = this.props.profile.careerEntries().count();
        let keySkillCount = this.props.profile.keySkillEntries().count();
        const data = [
            {name: PowerLocalize.get('Language.Abbreviation'),value: langCount},
            {name: PowerLocalize.get('Sector.Abbreviation'),value: secCount},
            {name: PowerLocalize.get('Qualification.Abbreviation'),value: qualCount},
            {name: PowerLocalize.get('Education.Abbreviation'),value: edCount},
            {name: PowerLocalize.get('Training.Abbreviation'),value: trainCount},
            {name: PowerLocalize.get('Career.Abbreviation'),value: careerCount},
            {name: PowerLocalize.get('KeySkill.Abbreviation'),value: keySkillCount},
        ];

        return(
            <Recharts.BarChart style={{width: '100% !important'}} width={300} height={200} layout="horizontal" data={data}>
                <Recharts.XAxis dataKey="name"/>
                <Recharts.YAxis />
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.Tooltip />
                <Recharts.Legend />
                <Recharts.Bar
                    dataKey="value"
                    fill="#8884d8"
                    layout="horizontal"
                />
            </Recharts.BarChart>
        );
    };

    render() {
        if(!this.props.available) {
            return <NoStatisticsAvailable/>;
        }
        if(isNullOrUndefined(this.props.profileSkillMetrics))
            return <div/>;
        return (
            <Paper className="dashboard-element">
                <div className="row">
                    <div className="col-md-3 col-sm-12 col-xs-12 vertical-align">

                    </div>

                    <div className="col-md-12 col-xs-12 col-sm-12">

                    </div>
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <h5>Profilbefüllung</h5>
                        {this.renderElementCounts()}
                    </div>
                </div>
            </Paper>);
    }
}

/**
 * Statistics for a single profile.
 * @see ProfileStatisticsModule
 * @author nt
 * @since 15.06.2017
 */
export const ProfileStatistics: React.ComponentClass<ProfileStatisticsLocalProps> = connect(ProfileStatisticsModule.mapStateToProps, ProfileStatisticsModule.mapDispatchToProps)(ProfileStatisticsModule);