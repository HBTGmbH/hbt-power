import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {SkillUsageMetric} from '../../../model/statistics/SkillUsageMetric';
import {Card, CardHeader, CardContent, Slide, ListSubheader} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ScatterSkill} from '../../../model/statistics/ScatterSkill';
import {compareNumbers} from '../../../utils/ObjectUtil';
import {ApplicationState} from '../../../reducers/reducerIndex';
import Button from '@material-ui/core/Button/Button';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

// TODO Slider
const Recharts = require('recharts');

const TagCloud = require('react-tagcloud');
const TCloud: any = TagCloud.TagCloud;

interface SkillStatisticsProps {
    usageMetrics: Immutable.List<SkillUsageMetric>;
    relativeUsageMetrics: Immutable.List<SkillUsageMetric>;
    scatterSkills: Immutable.List<ScatterSkill>;
}

interface SkillStatisticsLocalProps {

}

interface SkillStatisticsLocalState {
    skillOccLevelLength: number;
}

interface SkillStatisticsDispatch {

}


class SkillStatisticsModule extends React.Component<
    SkillStatisticsProps
    & SkillStatisticsLocalProps
    & SkillStatisticsDispatch, SkillStatisticsLocalState> {

    constructor(props: SkillStatisticsProps & SkillStatisticsLocalProps & SkillStatisticsDispatch) {
        super(props);
        this.state = {
            skillOccLevelLength: 20
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: SkillStatisticsLocalProps): SkillStatisticsProps {
        return {
            usageMetrics: state.statisticsReducer.skillUsages(),
            relativeUsageMetrics: state.statisticsReducer.relativeSkillUsages(),
            scatterSkills: state.statisticsReducer.scatteredSkills()
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
        return this.props.relativeUsageMetrics.map(usageMetric => {
            return {
                name: usageMetric.skillName(),
                value: usageMetric.skillUsage() * 100.0,
            }
        }).toArray().slice(0, 10);
    };

    private renderScatterData = () => {
        return this.props.scatterSkills.map(scatterSkill => {
            return {
                occ: scatterSkill.occurrences(),
                rating: scatterSkill.meanRating(),
                name: scatterSkill.name()
            }
        }).toArray().sort((s1, s2) => compareNumbers(s1.occ, s2.occ)).slice(0, this.state.skillOccLevelLength);
    };



    render() {
        return (<div>
            <Card>
                <CardHeader
                    title={PowerLocalize.get('Statistics.MostUsedSkills.Title')}
                />
                <CardContent>
                    <ListSubheader>{PowerLocalize.get("SkillStatistics.SkillCount.Absolute.Title")}</ListSubheader>
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
                </CardContent>
                <CardContent>
                    <ListSubheader>{PowerLocalize.get("SkillStatistics.SkillCount.Relative.Title")}</ListSubheader>
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
                </CardContent>
                <CardContent>
                    <ListSubheader>{PowerLocalize.get("SkillStatistics.WordCloud.Title")}</ListSubheader>
                        <TCloud
                            style={{width: "800px"}}
                            minSize={12}
                            maxSize={35}
                            tags={this.renderTags()}
                        />
                </CardContent>
                <CardContent>
                    <ListSubheader>{PowerLocalize.get("SkillStatistics.OccurrenceRating.Title")}</ListSubheader>
                    {/* TODO Slider
                    <Slide
                            direction={'down'}
                            style={{width: 700}}
                            //step={1}
                            //min={3}
                            //max={100}
                            //value={this.state.skillOccLevelLength}
                            //onChange={(event, value) => this.setState({skillOccLevelLength: value})}
                    />
                    */}
                    <div style={{marginLeft:'30px'}}>
                        <Button
                            style={{width:'40px',height:'40px',padding:'0',marginRight:'15px'}}
                            variant={'fab'}
                            color={'primary'}
                            onClick={() => this.setState({skillOccLevelLength: (this.state.skillOccLevelLength>0)?(this.state.skillOccLevelLength - 1):0})}
                        >
                            <RemoveIcon/>
                        </Button>

                        {this.state.skillOccLevelLength}

                        <Button
                            style={{width:'40px',height:'40px',padding:'0',marginLeft:'15px'}}
                            variant={'fab'} color={'primary'}
                            onClick={() => this.setState({skillOccLevelLength: (this.state.skillOccLevelLength<100)?(this.state.skillOccLevelLength + 1):100})}
                        >
                            <AddIcon/>
                        </Button>
                    </div>

                    <Recharts.ComposedChart width={700} height={400} data={this.renderScatterData()}
                                   margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                        <Recharts.XAxis dataKey="name"/>
                        <Recharts.YAxis />
                        <Recharts.Tooltip/>
                        <Recharts.Legend/>
                        <Recharts.CartesianGrid stroke='#f5f5f5'/>
                        <Recharts.Bar dataKey='occ' barSize={20} fill='#413ea0'/>
                        <Recharts.Line type='monotone' dataKey='rating' stroke='#ff7300'/>
                    </Recharts.ComposedChart>
                </CardContent>

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