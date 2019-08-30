import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {isNullOrUndefined} from 'util';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {NoStatisticsAvailable} from '../general/statistics/no-statistics-available_module.';
import {ApplicationState} from '../../reducers/reducerIndex';
import {Paper} from '@material-ui/core';
import {Color} from '../../utils/ColorUtil';
import {Profile} from '../../reducers/profile-new/profile/model/Profile';

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
            profile: state.profileStore.profile,
            available: state.statisticsReducer.available()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileStatisticsDispatch {
        return {};
    }


    private renderElementCounts = () => {
        let langCount: number = 0, secCount: number = 0, qualCount: number = 0, edCount: number = 0,
            trainCount: number = 0, careerCount: number = 0, keySkillCount: number = 0;
        if (!!this.props.profile) {
            langCount = !!this.props.profile.languages ? this.props.profile.languages.length : 0;
            secCount = !!this.props.profile.sectors ? this.props.profile.sectors.length : 0;
            qualCount = !!this.props.profile.qualification ? this.props.profile.qualification.length : 0;
            edCount = !!this.props.profile.education ? this.props.profile.education.length : 0;
            trainCount = !!this.props.profile.trainings ? this.props.profile.trainings.length : 0;
            careerCount = !!this.props.profile.careers ? this.props.profile.careers.length : 0;
            keySkillCount = !!this.props.profile.specialFieldEntries ? this.props.profile.specialFieldEntries.length : 0;
        }
        const data = [
            {name: PowerLocalize.get('Language.Plural'), value: langCount},
            {name: PowerLocalize.get('Sector.Plural'), value: secCount},
            {name: PowerLocalize.get('Qualification.Plural'), value: qualCount},
            {name: PowerLocalize.get('Education.Plural'), value: edCount},
            {name: PowerLocalize.get('Training.Plural'), value: trainCount},
            {name: PowerLocalize.get('Career.Plural'), value: careerCount},
            {name: PowerLocalize.get('SpecialField.Plural'), value: keySkillCount},
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
