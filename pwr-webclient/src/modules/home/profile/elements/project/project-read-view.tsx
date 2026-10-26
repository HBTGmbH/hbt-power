import * as React from 'react';
import {Chip, Typography} from '@material-ui/core';
import {Project} from '../../../../../reducers/profile-new/profile/model/Project';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {PwrFormSection, PwrRow} from '../../../../general/pwr-form-section';
import {PwrFormSubCaption} from '../../../../general/pwr-typography';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';
import {PROFILE_SKILLS_BY_NAME} from '../../../../../utils/Comparators';
import {SkillChip} from '../skills/skill-chip_module';
import {ProjectInternalNote} from './project-internal-note';

/** A label and its value; nothing for an empty value */
const Field = (props: {label: string, value?: string | null}) => {
    if (!props.value || !props.value.trim()) {
        return null;
    }
    return <div>
        <PwrFormSubCaption>{props.label}</PwrFormSubCaption>
        <Typography style={{whiteSpace: 'pre-wrap'}}>{props.value}</Typography>
        <PwrSpacer/>
    </div>;
};

const noChange = () => undefined;

/**
 * A project of a colleague, to read (#350): the same content as the project form, as text, nothing to change
 */
export const ProjectReadView = (props: {project: Project}) => {
    const project = props.project;
    const period = PowerLocalize.getFormatted('Profile.Project.List.Period',
        formatToShortDisplay(project.startDate), formatToShortDisplay(project.endDate));
    const roles = project.projectRoles || [];
    const skills = [...(project.skills || [])].sort(PROFILE_SKILLS_BY_NAME);
    const client = nameEntityName(project.client);
    const broker = nameEntityName(project.broker);
    return <div>
        <PwrSpacer size="tight"/>
        <PwrFormSection first>
            <Typography variant="h6" component="h2">{project.name}</Typography>
            <Typography color="textSecondary">{period}</Typography>
            <PwrSpacer/>
            <Field label={PowerLocalize.get('Profile.Project.Description')} value={project.description}/>
            {/* Closed until opened, like in the form (#336) */}
            <ProjectInternalNote key={project.id} value={project.internalNote} disabled onChange={noChange}/>
            <PwrSpacer/>
            {roles.length > 0 && <>
                <PwrFormSubCaption>{PowerLocalize.get('Profile.Project.Roles')}</PwrFormSubCaption>
                <PwrSpacer size="tight"/>
                <PwrRow>
                    {roles.map(role => <Chip key={role.id || role.name} label={role.name}/>)}
                </PwrRow>
            </>}
        </PwrFormSection>
        {(client || broker) && <PwrFormSection title={PowerLocalize.get('Profile.Project.ClientCaption')}>
            <Field label={PowerLocalize.get('Profile.Project.Client')} value={client}/>
            <Field label={PowerLocalize.get('Profile.Project.Broker')} value={broker}/>
        </PwrFormSection>}
        {skills.length > 0 && <PwrFormSection title={PowerLocalize.get('Profile.Project.Skills')}>
            <PwrRow>
                {skills.map(skill => <SkillChip key={skill.name} skill={skill} disabled onDelete={noChange}/>)}
            </PwrRow>
        </PwrFormSection>}
        <PwrSpacer/>
    </div>;
};
