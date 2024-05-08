import {connect} from 'react-redux';
import * as React from 'react';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {NoStatisticsAvailable} from '../general/statistics/no-statistics-available_module.';
import {ApplicationState} from '../../reducers/reducerIndex';
import Paper from '@material-ui/core/Paper';
import {Color} from '../../utils/ColorUtil';
import {Profile} from '../../reducers/profile-new/profile/model/Profile';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip} from "recharts";


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

    static mapStateToProps(state: ApplicationState): ProfileStatisticsProps {
        return {
            profileSkillMetrics: state.statisticsReducer.activeProfileMetric,
            profile: state.profileStore.profile,
            available: state.statisticsReducer.available
        };
    }

    static mapDispatchToProps(): ProfileStatisticsDispatch {
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
            trainCount = !!this.props.profile['trainingEntries'] ? this.props.profile['trainingEntries'].length : 0; // TODO wrong variable Name
            careerCount = !!this.props.profile['careerEntries'] ? this.props.profile['careerEntries'].length : 0; // TODO wrong variable Name
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
            <ResponsiveContainer minHeight={200} maxHeight={400}>
                <BarChart layout="horizontal" data={data}>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip />
                    <Bar
                        dataKey="value"
                        fill={Color.HBT_2017_DARK_BLUE.toCSSRGBString()}
                        layout="horizontal"
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    render() {
        if (!this.props.available) {
            return <NoStatisticsAvailable/>;
        }
        if (!this.props.profileSkillMetrics)
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
export const ProfileStatistics = connect(ProfileStatisticsModule.mapStateToProps, ProfileStatisticsModule.mapDispatchToProps)(ProfileStatisticsModule);
