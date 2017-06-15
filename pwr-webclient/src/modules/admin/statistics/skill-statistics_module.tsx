import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import * as Immutable from 'immutable';
import {SkillUsageMetric} from '../../../model/statistics/SkillUsageMetric';
import {Card, CardHeader, CardMedia, CardText, Subheader} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
const Recharts = require('recharts');

const TagCloud = require('react-tagcloud');
const TCloud: any = TagCloud.TagCloud;

interface SkillStatisticsProps {
    usageMetrics: Immutable.List<SkillUsageMetric>;
    relativeUsageMetrics: Immutable.List<SkillUsageMetric>;
}

interface SkillStatisticsLocalProps {

}

interface SkillStatisticsLocalState {

}

interface SkillStatisticsDispatch {

}

class SkillStatisticsModule extends React.Component<
    SkillStatisticsProps
    & SkillStatisticsLocalProps
    & SkillStatisticsDispatch, SkillStatisticsLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: SkillStatisticsLocalProps): SkillStatisticsProps {
        return {
            usageMetrics: state.statisticsReducer.skillUsages(),
            relativeUsageMetrics: state.statisticsReducer.relativeSkillUsages()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SkillStatisticsDispatch {
        return {};
    }

    private renderTags = () => {
        return this.props.usageMetrics.map(usageMetric => {
            return {
                value: usageMetric.skillName(),
                count: usageMetric.skillUsage(),
                key: usageMetric.skillName()
            };
        }).toArray();
    };

    private renderData = () => {
        return this.props.usageMetrics.map(usageMetric => {
            return {
                name: usageMetric.skillName(),
                value: usageMetric.skillUsage(),
            }
        }).toArray().slice(0, 10);
    };


    private renderRelativeData = () => {

        let res = this.props.relativeUsageMetrics.map(usageMetric => {
            return {
                name: usageMetric.skillName(),
                value: usageMetric.skillUsage() * 100.0,
            }
        }).toArray().slice(0, 10);
        console.log(res);
        return res;
    };

    render() {
        return (<div>
            <Card>
                <CardHeader
                    title={PowerLocalize.get('Statistics.MostUsedSkills.Title')}
                />
                <CardText>
                    <Subheader>{PowerLocalize.get("SkillStatistics.SkillCount.Absolute.Title")}</Subheader>
                    {PowerLocalize.get("SkillStatistics.SkillCount.Absolute.Description")}
                    <Recharts.BarChart width={730} height={250} layout="horizontal" data={this.renderData()}>
                        <Recharts.XAxis dataKey="name" />
                        <Recharts.YAxis />
                        <Recharts.CartesianGrid strokeDasharray="3 3" />
                        <Recharts.Tooltip />
                        <Recharts.Legend />
                        <Recharts.Bar
                            dataKey="value"
                            fill="#8884d8"
                            layout="vertical"
                            name={PowerLocalize.get("SkillStatistics.SkillCount")}/>
                    </Recharts.BarChart>
                </CardText>
                <CardText>
                    <Subheader>{PowerLocalize.get("SkillStatistics.SkillCount.Relative.Title")}</Subheader>
                    {PowerLocalize.get("SkillStatistics.SkillCount.Relative.Description")}<br/>
                    <Recharts.BarChart width={730} height={250} layout="horizontal" data={this.renderRelativeData()}>
                        <Recharts.XAxis dataKey="name" />
                        <Recharts.YAxis />
                        <Recharts.CartesianGrid strokeDasharray="3 3" />
                        <Recharts.Tooltip />
                        <Recharts.Legend />
                        <Recharts.Bar
                            unit="%"
                            dataKey="value"
                            fill="#8884d8"
                            layout="vertical"
                            name={PowerLocalize.get("SkillStatistics.SkillCount.Relative")}
                            />
                    </Recharts.BarChart>
                </CardText>
                <CardText>
                <Subheader>{PowerLocalize.get("SkillStatistics.WordCloud.Title")}</Subheader>
                    <TCloud
                        style={{width: "800px"}}
                        minSize={12}
                        maxSize={35}
                        tags={this.renderTags()}
                    />
                </CardText>
            </Card>

        </div>);
    }
}

/**
 * @see SkillStatisticsModule
 * @author nt
 * @since 15.06.2017
 */
export const SkillStatistics: React.ComponentClass<SkillStatisticsLocalProps> = connect(SkillStatisticsModule.mapStateToProps, SkillStatisticsModule.mapDispatchToProps)(SkillStatisticsModule);