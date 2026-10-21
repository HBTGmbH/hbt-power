import * as React from 'react';
import {Popper, PopperProps, TextField} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {ConsultantInfoDTO} from '../../model/ConsultantInfoDTO';
import {PowerLocalize} from '../../localization/PowerLocalizer';

interface ConsultantSelectProps {
    consultants: Array<ConsultantInfoDTO>;
    initials: string;
    /** A labelled form field (profile select, #135) instead of the white field in the app bar */
    label?: string;

    onSelect(initials: string): void;
}

/**
 * Name or initials, without regard to case, anywhere in the text
 */
function matches(consultant: ConsultantInfoDTO, input: string): boolean {
    const query = input.trim().toLowerCase();
    return consultant.name.toLowerCase().includes(query) || consultant.initials.toLowerCase().includes(query);
}

/**
 * The list is wider than the field, so whole names fit on a phone too
 */
const WidePopper = (props: PopperProps) => <Popper {...props} className="pwr-consultant-select-popper" placement="bottom-start"/>;

/**
 * Colleague selection for admins, in the app bar and in the profile select: typing filters the list by name and
 * initials (#131)
 */
export const ConsultantSelect = (props: ConsultantSelectProps) => {
    const selected = props.consultants.find(consultant => consultant.initials === props.initials) || null;
    // Explicit types: one consultant, never empty (disableClearable), no free text
    return <Autocomplete<ConsultantInfoDTO, false, true, false>
        className={props.label ? 'pwr-consultant-select-field' : 'pwr-consultant-select'}
        options={props.consultants}
        value={selected}
        disableClearable
        openOnFocus
        getOptionLabel={consultant => consultant.name}
        getOptionSelected={(option, value) => option.initials === value.initials}
        filterOptions={(options, state) => options.filter(option => matches(option, state.inputValue))}
        renderOption={consultant => <>
            {consultant.name}
            <span className="pwr-consultant-select-initials">{consultant.initials}</span>
        </>}
        noOptionsText={PowerLocalize.get('Toolbar.NoConsultantFound')}
        openText={PowerLocalize.get('Toolbar.OpenConsultantList')}
        closeText={PowerLocalize.get('Toolbar.CloseConsultantList')}
        PopperComponent={WidePopper}
        onChange={(_, consultant) => {
            if (consultant && consultant.initials !== props.initials) {
                props.onSelect(consultant.initials);
            }
        }}
        renderInput={params => props.label
            ? <TextField {...params} label={props.label}/>
            : <TextField {...params} variant="standard"
                         inputProps={{...params.inputProps, 'aria-label': PowerLocalize.get('Toolbar.SelectConsultant')}}/>}
    />;
};
