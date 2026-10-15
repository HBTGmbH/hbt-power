import * as React from 'react';
import {PwrAutoComplete} from './pwr-auto-complete';
import {noOp} from '../../utils/ObjectUtil';
import {SkillServiceClient} from '../../clients/SkillServiceClient';
import {useEffect, useState} from "react";


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


const defaultProps: SkillSearcherProps = {
    label: '',
    maxResults: 10,
    maxHeight: null,
    onNewRequest: noOp,
    onValueChange: noOp,
    resetOnRequest: true,
    disabled: false,
    id: ''
};


/**
 * Performs skill-searches against an API and displayes the suggestions the API provides, instead
 * of doing the skill-searching on a local dump of all available skills (>70.000)
 */
export const SkillSearcher = (props: SkillSearcherProps) => {
    props = {...defaultProps, ...props};
    const [searchText, setSearchText] = useState(props.initialValue);
    const [skills, setSkills] = useState([] as Array<string>);

    useEffect(() => {
        if (props.value) {
            requestSkills(props.value);
        }
    }, [props.value])

    const handleRequest = (request: string) => {
        props.onValueChange(request);
        setSearchText(props.resetOnRequest ? '' : request)
        props.onNewRequest(request);
    };

    const requestSkills = (searchText: string, navigation?: boolean) => {
        if (navigation) {
            setSearchText(searchText)
            return;
        } else {
            props.onValueChange(searchText);
            setSearchText(searchText)
            if (!!searchText && searchText.trim().length > 0) {
                SkillServiceClient.instance().getSearchSkill(searchText)
                    .then(skills => setSkills(skills))
                    .catch((error: any) => console.error((error)));
            }
        }
    };

    return <PwrAutoComplete
        disabled={props.disabled}
        fullWidth={props.fullWidth}
        label={props.label}
        id={props.id}
        data={skills}
        searchTerm={searchText}
        onAdd={handleRequest}
        onSearchChange={requestSkills}
    />
}
