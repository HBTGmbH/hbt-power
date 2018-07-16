import * as React from 'react';
import {ConsultantClusterInfo} from '../../../model/statistics/ConsultantClusterInfo';
import {Card, CardHeader, CardContent, List, ListItem, Popover} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AveragedSkill} from '../../../model/statistics/AveragedSkill';
import {StringUtils} from '../../../utils/StringUtil';
import formatString = StringUtils.formatString;

// TODO popover AnchoreEl

const randomColor = require('randomcolor');
const TagCloud = require('react-tagcloud');
const TCloud: any = TagCloud.TagCloud;

interface ConsultantClusterInfoProps {
    info: ConsultantClusterInfo;
}

interface ConsultantClusterInfoState {
    skillInfoPopoverOpen: boolean;
    skillInfoPopoverAnchor:  React.ReactInstance;
    tags: Array<any>;
    selectedSkillName: string;
}

export class ConsultantClusterOverview extends React.Component<ConsultantClusterInfoProps, ConsultantClusterInfoState> {



    private infoPaperStyle = {
        margin: "1px",
        padding: "5px"
    };


    private readonly customTagStyles = {
        margin: '0px 3px',
        verticalAlign: 'middle',
        display: 'inline-block'
    };

    constructor(props: ConsultantClusterInfoProps) {
        super(props);
        this.state = {
            skillInfoPopoverOpen: false,
            skillInfoPopoverAnchor: null,
            tags: this.renderTags(props),
            selectedSkillName: null
        }
    }

    public componentWillReceiveProps(nextProps: ConsultantClusterInfoProps) {
        console.log(nextProps.info !== this.props.info);
        if(nextProps.info !== this.props.info) {
            this.setState({
                tags: this.renderTags(nextProps)
            })
        }
    }


    private renderInitials = () => {
        return this.props.info.clusterInitials().map(initials => <ListItem disabled={true} key={initials}>{initials}</ListItem>).toArray();
    };

    private renderCommonSkills = () => {
        return this.props.info.commonSkills().map(skillName =>
        {
            const color = randomColor();
            return(<div
                key={skillName}
                style={{color: color, borderRadius: "20px", margin: "5px", padding: "5px", border: "1px solid " + color}}
            >
                {skillName}
            </div>)
        }).toArray();
    };

    private renderRecommendations = () => {
        return this.props.info.recommendations().map(skillName => <ListItem disabled={true} key={skillName}>{skillName}</ListItem>).toArray();
    };

    private renderTags = (props: ConsultantClusterInfoProps) => {
        return props.info.clusterSkills().map(skill => {
            return {
                value: skill.name(),
                count: skill.numberOfOccurrences(),
                key: skill.name()
            };
        }).toArray();
    };

    private handleTagClick = (evt: React.SyntheticEvent<any>, tagName: string) => {
        console.log(tagName + ' clicked');
        this.setState({
            skillInfoPopoverAnchor: evt.currentTarget,
            skillInfoPopoverOpen: true,
            selectedSkillName: tagName
        })
    };

    private customTagRenderer = (tag: any, size: number, color: any) => {
        const fontSize = size + 'px';
        const key = tag.key || tag.value;
        const style = Object.assign({}, this.customTagStyles, {color, fontSize});
        return <span className='tag-cloud-tag cursor-pointer' style={style} key={key} onClick={(evt) => this.handleTagClick(evt, tag.value)}>{tag.value}</span>;
    };

    private getSkill = (skillName: string) => {
        return this.props.info.clusterSkills().find(skill => skill.name() == skillName);
    };

    private getSkillInfo() {

        if(this.state.selectedSkillName != null) {
            let skill: AveragedSkill = this.getSkill(this.state.selectedSkillName);
            return (<Card>
                <CardHeader
                    title={skill.name()}
                />
                <CardContent>
                    {formatString("Der Skill {0} tritt {1} mal im Cluster auf.", skill.name(), String(skill.numberOfOccurrences()))}<br/>
                    {formatString("Damit haben {0}% der Berater in diesem Cluster diesen Skill.", (skill.relativeOccurrences() * 100).toFixed(2))}<br/>
                    {formatString("Das Durchschnittliche Skill-Level beträgt {0}/5.0.", skill.averageSkillLevel().toFixed(2))}<br/>
                </CardContent>
            </Card>)
        }
        return null;
    }

    render() {
        return (

            <div className="row">
                <Popover
                    open={this.state.skillInfoPopoverOpen}
                    anchorEl={this.state.skillInfoPopoverAnchor}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onClose={() => this.setState({skillInfoPopoverOpen: false})}
                >
                    {this.getSkillInfo()}
                </Popover>
                <div className="col-md-3" style={{padding: '10px'}}>
                    <Card>
                        <CardHeader
                            title={PowerLocalize.get('ClusterInfo.ClusterInitials.Title')}
                            subtitle={PowerLocalize.get('ClusterInfo.ClusterInitials.Subtitle')}
                        />
                        <CardContent>
                            <List>
                                {this.renderInitials()}
                            </List>
                        </CardContent>
                    </Card>
                </div>
                <div className="col-md-3" style={{padding: '10px'}}>
                    <Card>
                        <CardHeader
                            title={PowerLocalize.get('ClusterInfo.Recommendations.Title')}
                            subtitle={PowerLocalize.get('ClusterInfo.Recommendations.Subtitle')}
                        />
                        <CardContent>
                            <List>
                                {this.renderRecommendations()}
                            </List>
                        </CardContent>
                    </Card>
                </div>
                <div className="col-md-6" style={{padding: '10px'}}>
                    <Card>
                        <CardHeader
                            title={PowerLocalize.get('ClusterInfo.Skills.Title')}
                            subtitle={formatString(PowerLocalize.get('ClusterInfo.Skills.Subtitle'), String(this.props.info.clusterSkills().size))}
                        />
                        <CardContent>
                            <TCloud
                                style={{width: '100% !important'}}
                                minSize={12}
                                maxSize={35}
                                tags={this.state.tags}
                                renderer={this.customTagRenderer}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="col-md-6" style={{padding: '10px'}}>
                    <Card>
                        <CardHeader
                            title={PowerLocalize.get('ClusterInfo.CommonSkills.Title')}
                            subtitle={formatString(PowerLocalize.get('ClusterInfo.CommonSkills.Subtitle'), String(this.props.info.commonSkills().size))}
                        />
                        <CardContent className="row">
                            {this.renderCommonSkills()}
                        </CardContent>
                    </Card>
                </div>

            </div>);
    }
}
