import * as React from 'react';
import {useState} from 'react';
import {Collapse, Icon, Typography} from '@material-ui/core';
import {PwrButton} from '../../../../general/pwr-button';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {LimitedTextField} from '../../../../general/limited-text-field-module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {PROJECT_DESCRIPTION_LENGTH} from '../../../../../model/PwrConstants';

interface ProjectInternalNoteProps {
    value: string | null | undefined;
    disabled: boolean;

    onChange(internalNote: string): void;
}

/**
 * The internal note of a project (#336): only for inside HBT, in no view profile and no export. Closed, it only says
 * whether there is one; opened, it shows the text, in edit mode as a field as long as the description. Mounted per
 * project (key), so another project starts closed again.
 */
export const ProjectInternalNote = (props: ProjectInternalNoteProps) => {
    const [open, setOpen] = useState(false);
    const present = !!props.value && props.value.trim().length > 0;
    const label = PowerLocalize.get('Profile.Project.InternalNote')
        + ' · ' + PowerLocalize.get(present ? 'Profile.Project.InternalNote.Present' : 'Profile.Project.InternalNote.Empty');
    return <div>
        <PwrButton color="primary" text={label} ariaExpanded={open} ariaControls="project-internal-note"
                   icon={<Icon className="material-icons">{open ? 'expand_less' : 'expand_more'}</Icon>}
                   onClick={() => setOpen(!open)}/>
        <Collapse in={open}>
            <div id="project-internal-note">
                <PwrSpacer size="tight"/>
                <Typography variant="body2" color="textSecondary">
                    {PowerLocalize.get('Profile.Project.InternalNote.Hint')}
                </Typography>
                <PwrSpacer size="tight"/>
                <LimitedTextField
                    disabled={props.disabled}
                    hideProgress={props.disabled}
                    id="project-internal-note-text"
                    label={PowerLocalize.get('Profile.Project.InternalNote')}
                    maxCharacters={PROJECT_DESCRIPTION_LENGTH}
                    onChange={(_, internalNote) => props.onChange(internalNote)}
                    value={props.value || ''}
                    fullWidth
                    multiLine
                    rows={4}
                />
            </div>
        </Collapse>
    </div>;
};
