import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {isNullOrUndefined} from 'util';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Profile} from '../../model/Profile';
import {NoStatisticsAvailable} from '../general/statistics/no-statistics-available_module.';
import {ApplicationState} from '../../reducers/reducerIndex';
import {Paper} from '@material-ui/core';
import {Color} from '../../utils/ColorUtil';

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

class ProfileStatisticsModule extends React.Component<ProfileStatisticsProps
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
            {name: PowerLocalize.get('Language.Plural'), value: langCount},
            {name: PowerLocalize.get('Sector.Plural'), value: secCount},
            {name: PowerLocalize.get('Qualification.Plural'), value: qualCount},
            {name: PowerLocalize.get('Education.Plural'), value: edCount},
            {name: PowerLocalize.get('Training.Plural'), value: trainCount},
            {name: PowerLocalize.get('Career.Plural'), value: careerCount},
            {name: PowerLocalize.get('KeySkill.Plural'), value: keySkillCount},
        ];
        return (
            <Recharts.ResponsiveContainer minHeight={200} maxHeight={400}>
                <Recharts.BarChart layout="horizontal" data={data}>
                    <Recharts.XAxis dataKey="name"/>
                    <Recharts.YAxis/>
                    <Recharts.CartesianGrid strokeDasharray="3 3"/>
                    <Recharts.Tooltip/>
                    <Recharts.Bar
                        dataKey="value"
                        fill={Color.HBT_2017_DARK_BLUE.toCSSRGBString()}
                        layout="horizontal"
                    />
                </Recharts.BarChart>
            </Recharts.ResponsiveContainer>
        );
    };

    render() {
        if (!this.props.available) {
            return <NoStatisticsAvailable/>;
        }
        if (isNullOrUndefined(this.props.profileSkillMetrics))
            return <div/>;
        return (
            <Paper className="dashboard-element">
                <div className="col-md-12 vertical-align fullWidth">
                    <span style={{fontSize: '16px', fontWeight: 'bold', marginTop: '8px'}}>
                        Profil-Daten-Überblick
                    </span>
                </div>
                <div className="col-md-12 vertical-align fullWidth">
                    Gibt dir einen kurzen Überblick über den Befüllungsgrad deines Profils.
                </div>
                <div style={{paddingRight: '10%', paddingLeft: '5%'}}>
                    {this.renderElementCounts()}
                </div>
                <div style={{marginBottom: '35px'}}/>
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