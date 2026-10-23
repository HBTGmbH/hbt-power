import * as React from 'react';
import {Icon, Link} from '@material-ui/core';
import {Link as RouterLink} from 'react-router-dom';
import {Paths} from '../../../Paths';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

/**
 * To the skill statistics (#211): a link, not the main action of the page, and a real one, so a middle click opens a
 * new tab
 */
export const SkillStatisticsLink = (props: { initials: string }) =>
    <Link component={RouterLink} to={Paths.build(Paths.USER_STATISTICS_SKILLS, {initials: props.initials})}
          variant="body2" className="pwr-link-with-icon">
        {PowerLocalize.get('Dashboard.ToSkillStatistics')}
        <Icon className="material-icons" fontSize="small">arrow_forward</Icon>
    </Link>;
