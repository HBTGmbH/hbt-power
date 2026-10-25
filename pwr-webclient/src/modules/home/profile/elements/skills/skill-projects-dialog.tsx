import * as React from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@material-ui/core';
import {Project} from '../../../../../reducers/profile-new/profile/model/Project';
import {PwrListTable} from '../../../../general/pwr-list-table';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {PwrButton} from '../../../../general/pwr-button';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';
import {formatMonths, projectMonths, SkillUsage} from '../../../../../utils/SkillUsage';

interface SkillProjectsDialogProps {
    skillName: string;
    usage: SkillUsage;

    onClose(): void;
}

/**
 * The projects in which a skill was used, with their periods and the time in all of them (#312)
 */
export const SkillProjectsDialog = (props: SkillProjectsDialogProps) => {
    const title = PowerLocalize.getFormatted('Profile.Skills.Projects.Title', props.skillName);
    return <Dialog open onClose={props.onClose} fullWidth maxWidth="md">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <PwrListTable<Project> label={title} items={props.usage.projects} itemKey={project => String(project.id)}
                                   columns={[
                                       {header: PowerLocalize.get('Profile.Skills.Projects.Project'), render: project => project.name},
                                       {header: PowerLocalize.get('Profile.Skills.Projects.Client'), render: project => nameEntityName(project.client)},
                                       {
                                           header: PowerLocalize.get('Profile.Skills.Projects.Period'), width: 180,
                                           render: project => PowerLocalize.getFormatted('Profile.Project.List.Period',
                                               formatToShortDisplay(project.startDate), formatToShortDisplay(project.endDate))
                                       },
                                       {
                                           header: PowerLocalize.get('Profile.Skills.Projects.Duration'), width: 110, alignRight: true,
                                           render: project => formatMonths(projectMonths(project))
                                       },
                                   ]}/>
            <PwrSpacer/>
            <Typography variant="body2">
                {PowerLocalize.getFormatted('Profile.Skills.Projects.Total', formatMonths(props.usage.months))}
            </Typography>
        </DialogContent>
        <DialogActions>
            <PwrButton variant="contained" color="primary" text={PowerLocalize.get('Action.Close')} onClick={props.onClose}/>
        </DialogActions>
    </Dialog>;
};
