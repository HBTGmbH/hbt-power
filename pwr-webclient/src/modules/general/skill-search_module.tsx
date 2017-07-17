import * as React from 'react';
import {AutoComplete} from 'material-ui';
import axios, {AxiosResponse} from 'axios';
import {getSearchSkill} from '../../API_CONFIG';
import {isNullOrUndefined} from 'util';

interface SkillSearcherProps {
    floatingLabelText?: string;
    maxResults?: number;
    maxHeight?: number;
    id: string;
    onNewRequest?(request: string): void;
    /**
     * Fired everytime the value changes(User input) and returns the value the user typed in.
     * @param value
     */
    onValueChange?(value: string): void;
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
        maxResults: 10,
        maxHeight: null,
        onNewRequest: request => {},
        onValueChange: val => {},
    };

    private requestSkills = (searchText: string, dataSource: any) => {
        if(!isNullOrUndefined(searchText) && searchText.trim().length > 0) {
            this.props.onValueChange(searchText);
            let reqParams = {
                maxResults: this.props.maxResults
            };
            axios.get(getSearchSkill(searchText), {params: reqParams}).then((response: AxiosResponse) => {
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
        }
    };

    private handleRequest = (request: string) => {
        this.setState({
            searchText: " "
        });
        this.props.onNewRequest(request)
    };
    render() {
        return (
            <AutoComplete
                id={this.props.id}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                floatingLabelText={this.props.floatingLabelText}
                dataSource={this.state.skills}
                searchText={this.state.searchText}
                onNewRequest={this.handleRequest}
                onUpdateInput={this.requestSkills}
                menuProps={{maxHeight: this.props.maxHeight}}
                filter={AutoComplete.noFilter}
            />)
    }
}