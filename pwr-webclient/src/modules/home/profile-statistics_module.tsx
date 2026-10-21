import {connect} from 'react-redux';
import * as React from 'react';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ApplicationState} from '../../reducers/reducerIndex';
import Paper from '@material-ui/core/Paper';
import {Color} from '../../utils/ColorUtil';
import {Profile} from '../../reducers/profile-new/profile/model/Profile';
import {Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";


interface ProfileStatisticsProps {
    profile: Profile;
    /**
     * The store holds the profile of the consultant with the given initials, not that of the one shown before.
     */
    profileLoaded: boolean;
}

interface ProfileStatisticsLocalProps {
    initials: string;
}

interface ProfileStatisticsLocalState {

}

interface ProfileStatisticsDispatch {

}

class ProfileStatisticsModule extends React.Component<ProfileStatisticsProps
    & ProfileStatisticsLocalProps
    & ProfileStatisticsDispatch, ProfileStatisticsLocalState> {

    static mapStateToProps(state: ApplicationState, ownProps: ProfileStatisticsLocalProps): ProfileStatisticsProps {
        const {consultant, profile} = state.profileStore;
        return {
            profile,
            profileLoaded: consultant.initials === ownProps.initials && !!profile.id && profile.id === consultant.profileId
        };
    }

    static mapDispatchToProps(): ProfileStatisticsDispatch {
        return {};
    }


    private renderElementCounts = () => {
        const profile = this.props.profile;
        const count = (entries: Array<any> | undefined) => (!!entries ? entries.length : 0);
        const data = [
            {name: PowerLocalize.get('Language.Plural'), value: count(profile.languages)},
            {name: PowerLocalize.get('Training.Plural'), value: count(profile['trainingEntries'])}, // TODO wrong variable Name
            {name: PowerLocalize.get('Education.Plural'), value: count(profile.education)},
            {name: PowerLocalize.get('Qualification.Plural'), value: count(profile.qualification)},
            {name: PowerLocalize.get('Sector.Plural'), value: count(profile.sectors)},
            {name: PowerLocalize.get('SpecialField.Plural'), value: count(profile.specialFieldEntries)},
            {name: PowerLocalize.get('Career.Plural'), value: count(profile['careerEntries'])}, // TODO wrong variable Name
            {name: PowerLocalize.get('Skill.Plural'), value: count(profile.skills)},
            {name: PowerLocalize.get('Project.Plural'), value: count(profile.projects)},
        ];
        // Bar length log(n + 1): many skills don't squeeze the other sections, 0 stays an empty bar, 1 a short one.
        // The label and the tooltip show the real count.
        const bars = data.map(entry => ({...entry, length: Math.log10(entry.value + 1)}));
        // Horizontal bars (#139): the names stay readable on a narrow card, the count stands at the end of each bar
        return (
            <ResponsiveContainer width="100%" height={bars.length * 32 + 32}>
                <BarChart layout="vertical" data={bars} margin={{top: 8, right: 40, bottom: 8, left: 8}}>
                    {/* Fixed up to 100 entries, so profiles compare; more entries stretch it */}
                    <XAxis type="number" hide domain={[0, (dataMax: number) => Math.max(dataMax, Math.log10(101))]}/>
                    <YAxis type="category" dataKey="name" width={170} tickLine={false} axisLine={false}/>
                    <Tooltip cursor={{fill: 'rgba(0, 0, 0, 0.04)'}}
                             formatter={(_: any, name: string, item: any) => [item.payload.value, name]}/>
                    <Bar dataKey="length" name={PowerLocalize.get('ProfileStatistics.Count')}
                         fill={Color.HBT_2017_DARK_BLUE.toCSSRGBString()} barSize={16} isAnimationActive={false}>
                        <LabelList dataKey="value" position="right"/>
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    render() {
        // Counts the entries of the profile, so it does not depend on the statistics service
        if (!this.props.profileLoaded) {
            return <div/>;
        }
        return (
            <Paper className="dashboard-element">
                <div className="col-md-12 vertical-align fullWidth">
                    <span style={{fontSize: '16px', fontWeight: 'bold', marginTop: '8px'}}>
                        {PowerLocalize.get('ProfileStatistics.Title')}
                    </span>
                </div>
                <div className="col-md-12 vertical-align fullWidth">
                    {PowerLocalize.get('ProfileStatistics.Description')}
                </div>
                {/* Below the floating header columns, so the card grows with the chart */}
                <div style={{clear: 'both', padding: '8px 16px 16px'}}>
                    {this.renderElementCounts()}
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
export const ProfileStatistics = connect(ProfileStatisticsModule.mapStateToProps, ProfileStatisticsModule.mapDispatchToProps)(ProfileStatisticsModule);
