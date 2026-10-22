import * as React from 'react';
import {useEffect, useState} from 'react';
import {FormControl, InputLabel, MenuItem, Select} from '@material-ui/core';
import {SkillServiceClient} from '../../../clients/SkillServiceClient';
import {LocalizationLanguage} from '../../../model/view/LocalizationLanguage';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

interface LocalizationSelectProps {
    /** ISO 639-2 code, null for the names of the skill tree */
    value: string | null;
    className?: string;

    onChange(language: string | null): void;
}

/** The value of „Keine“: a Select needs a string */
const NONE = '';

let instances = 0;

/**
 * Language of the skill and category names of a view profile (#174): none (the names of the skill tree) or one of the
 * languages that have localizations. A language chosen before stays selectable when its localizations are gone.
 */
export const LocalizationSelect = (props: LocalizationSelectProps) => {
    const [languages, setLanguages] = useState<Array<LocalizationLanguage>>([]);
    // The dialog and the page can show one each
    const [labelId] = useState(() => 'pwr-localization-select-' + (instances++));

    useEffect(() => {
        let active = true;
        SkillServiceClient.instance().getLocalizationLanguages()
            .then(result => active && setLanguages(result))
            // Without the list only „Keine“ is offered
            .catch(error => console.error(error));
        return () => {
            active = false;
        };
    }, []);

    const options = props.value && !languages.some(language => language.code === props.value)
        ? [...languages, {code: props.value, name: props.value}]
        : languages;
    return <FormControl variant="filled" className={props.className}>
        {/* Shrunk: „Keine“ is a value of its own, the field is never empty */}
        <InputLabel id={labelId} shrink>{PowerLocalize.get('ViewProfileLocalization.Label')}</InputLabel>
        <Select labelId={labelId}
                displayEmpty
                value={props.value || NONE}
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                    const value = event.target.value as string;
                    props.onChange(value === NONE ? null : value);
                }}>
            <MenuItem value={NONE}>{PowerLocalize.get('ViewProfileLocalization.None')}</MenuItem>
            {options.map(language =>
                <MenuItem key={language.code} value={language.code}>
                    {PowerLocalize.getFormatted('ViewProfileLocalization.Language', language.name, language.code)}
                </MenuItem>)}
        </Select>
    </FormControl>;
};
