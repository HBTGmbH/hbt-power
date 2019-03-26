import * as React from 'react';
import axios, {AxiosResponse} from 'axios';
import * as Immutable from 'immutable';
import {List, ListItem, Paper} from '@material-ui/core';
import {getSearchSkill, postFindConsultantBySkills} from '../../../API_CONFIG';
import {APISkill} from '../../../model/APIProfile';
import {PwrAutoComplete} from '../pwr-auto-complete';
// Documentation: https://github.com/TeamWertarbyte/material-ui-chip-input
const ChipInput = require('material-ui-chip-input').default;


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
        axios.post(postFindConsultantBySkills(), this.state.currentSearchSkills.toArray()).then((response: AxiosResponse) => {
            this.setState({
                foundConsultants: Immutable.List<ConsultantSkillInfo>(response.data)
            });
        }).catch((error: any) => {
            this.setState({
                foundConsultants: Immutable.List<ConsultantSkillInfo>()
            });
        });
    };

    public componentDidUpdate(prevProps: ConsultantSkillSearchProps, prevState: ConsultantSkillSearchState) {
        if (this.state.currentSearchSkills != prevState.currentSearchSkills) this.executeSearch();
    };

    private handleAddSkill = (skill: string) => {
        //console.log('Add skill', skill);
        this.setState({
            currentSearchSkills: this.state.currentSearchSkills.push(skill)
        });
    };

    private handleRemoveSkill = (skill: string) => {
        //console.log('Remove skill', skill);
        this.setState({
            currentSearchSkills: Immutable.List<string>(this.state.currentSearchSkills.filter(s => s != skill))
        });
    };


    private handleUpdateInput = (value: string) => {
        if (value.trim().length > 0) {
            let prev = this.state.currentSuggestSkills;
            let reqParams = {
                maxResults: this.MAX_RESULTS,
                searchterm: value
            };
            this.setState({
                searchTerm: value
            });
            axios.get(getSearchSkill(), {params: reqParams}).then((response: AxiosResponse) => {
                if (response.status === 200) {
                    this.setState({
                        currentSuggestSkills: response.data
                    });
                } else if (response.status === 204) {
                    this.setState({
                        currentSuggestSkills: []
                    });
                }
            }).catch((error: any) => {
                console.error((error));
            });
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
                        {this.state.foundConsultants.map(consultant => <ListItem
                            key={'Consultant.Search.' + consultant.fullName}>{this.renderConsultantInfo(consultant)}</ListItem>)}
                    </List>
                </div>
            </div>

        </Paper>);
    }
}
