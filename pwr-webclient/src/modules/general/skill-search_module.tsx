import * as React from 'react';
import {isNullOrUndefined} from 'util';
import {PwrAutoComplete} from './pwr-auto-complete';
import {noOp} from '../../utils/ObjectUtil';
import {SkillServiceClient} from '../../clients/SkillServiceClient';


interface SkillSearcherProps {
    label?: string;
    disabled?: boolean;
    maxResults?: number;
    maxHeight?: number | string;
    id: string;
    value?: string;
    initialValue?: string;
    resetOnRequest?: boolean;
    fullWidth?: boolean;

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
            searchText: !isNullOrUndefined(props.initialValue) ? props.initialValue : '',
            skills: []
        };

    }

    public componentWillReceiveProps(props: SkillSearcherProps) {
        if (!isNullOrUndefined(props.value) && this.props.value !== props.value) {
            this.requestSkills(props.value);
        }
    }

    public static defaultProps: Partial<SkillSearcherProps> = {
        label: '',
        maxResults: 10,
        maxHeight: null,
        onNewRequest: noOp,
        onValueChange: noOp,
        resetOnRequest: true,
        disabled: false
    };

    private requestSkills = (searchText: string, navigation?: boolean) => {
        if (navigation) {
            this.setState({
                searchText: searchText
            });
            return;
        } else {
            this.props.onValueChange(searchText);
            this.setState({
                searchText: searchText
            });
            if (!isNullOrUndefined(searchText) && searchText.trim().length > 0) {
                SkillServiceClient.instance().getSearchSkill(searchText)
                    .then(skills => this.setState({skills}))
                    .catch((error: any) => console.error((error)));
            }
        }
    };

    private handleRequest = (request: string) => {
        this.props.onValueChange(request);
        this.setState({
            searchText: this.props.resetOnRequest ? '' : request
        });
        this.props.onNewRequest(request);
    };

    render() {
        return <PwrAutoComplete
            disabled={this.props.disabled}
            fullWidth={this.props.fullWidth}
            label={this.props.label}
            id={this.props.id}
            data={this.state.skills}
            searchTerm={this.state.searchText}
            onAdd={this.handleRequest}
            onSearchChange={this.requestSkills}
        />;
    }
}
