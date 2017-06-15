import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../Store';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {isNullOrUndefined} from 'util';
import {Subheader} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Profile} from '../../model/Profile';

const Recharts = require('recharts');

interface ProfileStatisticsProps {
    profileSkillMetrics: ProfileSkillMetrics;
    profile: Profile;
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
            profile: state.databaseReducer.profile()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileStatisticsDispatch {
        return {}
    }

    private renderCommonSkills = () => {
        let commonSkills: String = "";
        let prefix = "";
        this.props.profileSkillMetrics.commonSkills().forEach(com => {
            commonSkills += prefix;
            commonSkills += com;
            prefix = " ,";
        });
        return commonSkills;
    };

    private renderMissingSkills = () => {
        if(this.props.profileSkillMetrics.missingSkills().size == 0) return PowerLocalize.get("None");
        let missingSkills: String = "";
        let prefix = "";
        this.props.profileSkillMetrics.missingSkills().forEach(com => {
            missingSkills += prefix;
            missingSkills += com;
            prefix = " ,";
        });
        return missingSkills;
    };

    private renderElementCounts = () => {
        let langCount = this.props.profile.languageSkills().count();
        let secCount = this.props.profile.sectorEntries().count();
        let qualCount = this.props.profile.qualificationEntries().count();
        let edCount = this.props.profile.educationEntries().count();
        let trainCount = this.props.profile.trainingEntries().count();
        let careerCount = this.props.profile.careerEntries().count();
        let keySkillCount = this.props.profile.keySkillEntries().count();
        const data = [
            {name: PowerLocalize.get("Language.Abbreviation"),value: langCount},
            {name: PowerLocalize.get("Sector.Abbreviation"),value: secCount},
            {name: PowerLocalize.get("Qualification.Abbreviation"),value: qualCount},
            {name: PowerLocalize.get("Education.Abbreviation"),value: edCount},
            {name: PowerLocalize.get("Training.Abbreviation"),value: trainCount},
            {name: PowerLocalize.get("Career.Abbreviation"),value: careerCount},
            {name: PowerLocalize.get("KeySkill.Abbreviation"),value: keySkillCount},
        ];

        return(
            <Recharts.BarChart style={{width: "100% !important"}} width={700} height={200} layout="horizontal" data={data}>
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
        )
    };

    render() {
        if(isNullOrUndefined(this.props.profileSkillMetrics))
            return <div/>;
        return (<div>
            <h4>Profil-Statistiken</h4>
            <h5>Standard-Skills, die auch in diesem Profil vorhanden sind:</h5> {this.renderCommonSkills()}
            <h5>Standard-Skills, die diesem Profil fehlen:</h5> {this.renderMissingSkills()}
            <h5>Profilbefüllung</h5>
            <div className="row">
                <div className="col-md-6">
                    {this.renderElementCounts()}
                </div>
            </div>


        </div>);
    }
}

/**
 * Statistics for a single profile.
 * @see ProfileStatisticsModule
 * @author nt
 * @since 15.06.2017
 */
export const ProfileStatistics: React.ComponentClass<ProfileStatisticsLocalProps> = connect(ProfileStatisticsModule.mapStateToProps, ProfileStatisticsModule.mapDispatchToProps)(ProfileStatisticsModule);