import * as React from 'react';
import {AutoComplete, Popover, TextField} from 'material-ui';
import * as Immutable from 'immutable';
import axios, {AxiosResponse} from 'axios';

interface SkillSearcherProps {
    floatingLabelText?: string;
    apiUrl?: string;
    maxResults?: number;
    id: string;
    onNewRequest?(request: string): void;
}

interface SkillSearcherState {
    searchText: string;
    skills: Array<string>
}

/**
 * Performs skill-searches against an API and displayes the suggestions the API provides, instead
 * of doing the skill-searching on a local dump of all available skills (>70.000)
 */
export class SkillSearcher extends React.Component<SkillSearcherProps, SkillSearcherState> {



    constructor(props: SkillSearcherProps) {
        super(props);
        this.state = {
            searchText: "",
            skills: []
        }

    }

    public static defaultProps: Partial<SkillSearcherProps> = {
        floatingLabelText: "",
        apiUrl: "http://localhost:8080/skill/search/",
        maxResults: 10,
        onNewRequest: request => {}
    };

    private requestSkills = (searchText: string, dataSource: any) => {
        let reqParams = {
            maxResults: this.props.maxResults
        };
        console.log("Requesting skills");
        axios.get(this.props.apiUrl + searchText, {params: reqParams}).then((response: AxiosResponse) => {
            console.log("Skills", response.data);
            if(response.status === 200) {
                this.setState({
                    skills: response.data
                })
            } else if(response.status === 204) {
                this.setState({
                    skills: []
                })
            }
        }).catch((error: any) => {
            console.error((error));
        });
    };

    private handleRequest = () => {

    };
    render() {
        return (
            <AutoComplete
                id={this.props.id}
                floatingLabelText={this.props.floatingLabelText}
                dataSource={this.state.skills}
                searchText={this.state.searchText}
                onNewRequest={this.props.onNewRequest}
                onUpdateInput={this.requestSkills}
                filter={AutoComplete.noFilter}
            />)
    }
}