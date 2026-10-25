import * as React from 'react';
import {Typography} from '@material-ui/core';
import {Project} from '../../../../../reducers/profile-new/profile/model/Project';
import {PwrListTable} from '../../../../general/pwr-list-table';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';
import {formatMonths, projectMonths, SkillUsage} from '../../../../../utils/SkillUsage';

interface SkillProjectsTableProps {
    skillName: string;
    usage: SkillUsage;
}

const projectWithClient = (project: Project) => {
    const client = nameEntityName(project.client);
    return <>
        {project.name}
        {client && <Typography variant="caption" color="textSecondary" component="div">{client}</Typography>}
    </>;
};

/**
 * The projects in which a skill was used, with their periods, for the skill dialog (#312)
 */
export const SkillProjectsTable = (props: SkillProjectsTableProps) => {
    return <>
        <PwrListTable<Project> label={PowerLocalize.getFormatted('Profile.Skills.Projects.Title', props.skillName)}
                               items={props.usage.projects} itemKey={project => String(project.id)}
                               columns={[
                                   {header: PowerLocalize.get('Profile.Skills.Projects.Project'), render: projectWithClient},
                                   {
                                       header: PowerLocalize.get('Profile.Skills.Projects.Period'), width: 160,
                                       render: project => PowerLocalize.getFormatted('Profile.Project.List.Period',
                                           formatToShortDisplay(project.startDate), formatToShortDisplay(project.endDate))
                                   },
                                   {
                                       header: PowerLocalize.get('Profile.Skills.Projects.Duration'), width: 100, alignRight: true,
                                       render: project => formatMonths(projectMonths(project))
                                   },
                               ]}/>
        {props.usage.projects.length > 1 && <>
            <PwrSpacer size="tight"/>
            <Typography variant="caption" color="textSecondary" component="div">
                {PowerLocalize.get('Profile.Skills.Projects.Overlap')}
            </Typography>
        </>}
    </>;
};
