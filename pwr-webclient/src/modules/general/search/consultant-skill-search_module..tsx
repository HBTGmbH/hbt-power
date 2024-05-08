import * as React from 'react';
import * as Immutable from 'immutable';
import {List, ListItem, Paper} from '@material-ui/core';
import {APISkill} from '../../../model/APIProfile';
import {PwrAutoComplete} from '../pwr-auto-complete';
import {StatisticsServiceClient} from '../../../clients/StatisticsServiceClient';
import {SkillServiceClient} from '../../../clients/SkillServiceClient';


interface ConsultantSkillInfo {
    fullName: string;
    skills: Array<APISkill>;
}

interface ConsultantSkillSearchProps {

}

interface ConsultantSkillSearchState {
    foundConsultants: Immutable.List<ConsultantSkillInfo>;
    currentSearchSkills: Immutable.List<string>;
    currentSuggestSkills: Array<string>;
    searchTerm: string;
}

/**
 * Allows searching of consultants
 */
export class ConsultantSkillSearch extends React.Component<ConsultantSkillSearchProps, ConsultantSkillSearchState> {

    constructor(props: ConsultantSkillSearchProps) {
        super(props);
        this.state = {
            foundConsultants: Immutable.List<ConsultantSkillInfo>(),
            currentSearchSkills: Immutable.List<string>(),
            currentSuggestSkills: [],
            searchTerm: ''
        };
    }

    private readonly MAX_RESULTS: number = 10;


    componentDidMount() {
        this.executeSearch();
    }

    private executeSearch = () => {
        StatisticsServiceClient.instance().postFindConsultantBySkills(this.state.currentSearchSkills.toArray())
            .then(skillInfo => this.setState({foundConsultants: Immutable.List<ConsultantSkillInfo>(skillInfo)}))
            .catch((error: any) => this.setState({foundConsultants: Immutable.List<ConsultantSkillInfo>()}));
    };

    public componentDidUpdate(prevProps: ConsultantSkillSearchProps, prevState: ConsultantSkillSearchState) {
        if (this.state.currentSearchSkills != prevState.currentSearchSkills) {
            this.executeSearch();
        }
    };

    private handleAddSkill = (skill: string) => {
        this.setState({
            currentSearchSkills: this.state.currentSearchSkills.push(skill)
        });
    };

    private handleRemoveSkill = (skill: string) => {
        this.setState({
            currentSearchSkills: Immutable.List<string>(this.state.currentSearchSkills.filter(s => s != skill))
        });
    };


    private handleUpdateInput = (value: string) => {
        if (value.trim().length > 0) {
            this.setState({
                searchTerm: value
            });
            SkillServiceClient.instance().getSearchSkill(value)
                .then(currentSuggestSkills => this.setState({currentSuggestSkills}))
                .catch((error: any) => console.error((error)));
        }
    };

    private renderConsultantInfo = (consultant: ConsultantSkillInfo) => {
        let res: string = consultant.fullName;
        consultant.skills.forEach(skill => {
            res += ' / ';
            res += skill.name;
            res += ': ';
            res += skill.rating;
        });
        return res;
    };


    render() {
        return (<Paper style={{padding: '16px'}}>
            <div className="row" style={{paddingLeft: '20px'}}>
                <PwrAutoComplete fullWidth={true}
                                 disableFiltering={true}
                                 data={this.state.currentSuggestSkills}
                                 searchTerm={this.state.searchTerm}
                                 chips={this.state.currentSearchSkills.toArray()}
                                 label={'Skills'}
                                 multi={true}
                                 onAdd={this.handleAddSkill}
                                 onRemove={this.handleRemoveSkill}
                                 onSearchChange={this.handleUpdateInput}
                />
            </div>
            <div className="row" style={{paddingLeft: '20px'}}>
                <div className="col-md-11">
                    <List>
                        <>
                        {this.state.foundConsultants.map(consultant => <ListItem
                            key={'Consultant.Search.' + consultant.fullName}>{this.renderConsultantInfo(consultant)}</ListItem>)}
                        </>
                    </List>
                </div>
            </div>

        </Paper>);
    }
}
