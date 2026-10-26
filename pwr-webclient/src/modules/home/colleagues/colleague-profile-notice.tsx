import * as React from 'react';
import {Icon, makeStyles, Paper, Typography} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {OIDCService} from '../../../OIDCService';
import {Paths} from '../../../Paths';
import {PWR_ACCENT} from '../../../PowerTheme';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {selectConsultantName} from '../../../reducers/consultant-names/ConsultantNameActionCreator';

const useStyles = makeStyles(theme => ({
    // The HBT orange only as a bar (#201), the text dark on white
    notice: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing(1),
        padding: theme.spacing(1, 2),
        borderLeft: '6px solid ' + PWR_ACCENT,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
}));

interface ColleagueProfileNoticeProps {
    initials: string;
}

/**
 * Above the profile of a colleague, which the user only reads (#350): whose it is, and the way back to the own
 * profile and to the colleagues
 */
export const ColleagueProfileNotice = (props: ColleagueProfileNoticeProps) => {
    const classes = useStyles();
    const name = useSelector((state: ApplicationState) => selectConsultantName(state, props.initials));
    const own = OIDCService.instance().ownInitials();
    const link = (to: string, icon: string, localizationKey: string) =>
        // Material-UI marks anything but a plain <a> as a button; this is a link
        <Button color="primary" component={Link} to={to} role="link"
                endIcon={<Icon className="material-icons">{icon}</Icon>}>
            {PowerLocalize.get(localizationKey)}
        </Button>;
    return <div className="mui-margin">
        <Paper className={classes.notice} role="note">
            <Typography className={classes.text}>
                <Icon className="material-icons" color="action">visibility</Icon>
                {PowerLocalize.getFormatted('Colleagues.Notice', name ? name.fullName : props.initials)}
            </Typography>
            {own && <div>
                {link(Paths.build(Paths.USER_COLLEAGUES, {initials: own}), 'groups', 'Colleagues.Notice.ToColleagues')}
                {link(Paths.build(Paths.USER_PROFILE, {initials: own}), 'account_box', 'Colleagues.Notice.ToOwnProfile')}
            </div>}
        </Paper>
    </div>;
};
