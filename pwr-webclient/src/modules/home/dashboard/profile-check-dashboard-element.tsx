import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Icon,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tooltip,
    Typography
} from '@material-ui/core';
import {PwrConfirmActions} from '../../general/pwr-form-actions';
import {makeStyles} from '@material-ui/core/styles';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {LoginStatus} from '../../../model/LoginStatus';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ProfileServiceClient} from '../../../clients/ProfileServiceClient';
import {ProfileCheck, ProfileCheckHintType, ProfileConfirmation} from '../../../model/check/ProfileCheck';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {formatToNumericDateTime, formatToRelativeTime} from '../../../utils/DateUtil';
import {hintIcon, hintLink, hintText} from '../../general/profile-check/profile-check-hints';
import {PwrButton} from '../../general/pwr-button';
import {PwrRow} from '../../general/pwr-form-section';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {Alerts} from '../../../utils/Alerts';

const useStyles = makeStyles(theme => ({
    card: {
        padding: theme.spacing(2),
    },
    title: {
        fontSize: '16px',
        fontWeight: 'bold',
    },
    hint: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    icon: {
        minWidth: theme.spacing(5),
    },
    missing: {
        color: theme.palette.error.main,
    },
    outdated: {
        color: theme.palette.warning.main,
    },
    neutral: {
        color: theme.palette.text.secondary,
    },
}));

/**
 * A time as fuzzy time, the exact time in the tooltip
 */
const When = (props: { time: string | null }) => {
    if (!props.time) {
        return <>{PowerLocalize.get('ProfileCheck.Unknown')}</>;
    }
    return <Tooltip title={formatToNumericDateTime(new Date(props.time))}>
        <span>{formatToRelativeTime(props.time)}</span>
    </Tooltip>;
};

/**
 * Admins only: how often the profile was only confirmed, so nobody silences the check for good
 */
const ConfirmationLog = (props: { initials: string, check: ProfileCheck }) => {
    const [confirmations, setConfirmations] = useState<Array<ProfileConfirmation> | null>(null);
    useEffect(() => {
        let current = true;
        ProfileServiceClient.instance().getProfileConfirmations(props.initials)
            .then(result => current && setConfirmations(result))
            .catch(() => current && setConfirmations(null));
        return () => {
            current = false;
        };
    }, [props.initials, props.check.lastConfirmed]);
    if (!confirmations || confirmations.length === 0) {
        return null;
    }
    const lastChange = [props.check.lastEdited, props.check.skillsLastEdited, props.check.projectsLastEdited]
        .filter(time => !!time)
        .map(time => new Date(time).getTime())
        .reduce((latest, time) => Math.max(latest, time), 0);
    const sinceChange = confirmations.filter(confirmation => new Date(confirmation.confirmedAt).getTime() > lastChange).length;
    return <>
        <PwrSpacer/>
        <Typography variant={'subtitle2'}>{PowerLocalize.get('ProfileCheck.Confirmations.Title')}</Typography>
        <Typography variant={'body2'} color={sinceChange >= 2 ? 'error' : 'textSecondary'}>
            {PowerLocalize.getFormatted('ProfileCheck.Confirmations.SinceChange', sinceChange)}
        </Typography>
        {confirmations.slice(0, 5).map(confirmation =>
            <Typography key={confirmation.id} variant={'body2'} color={'textSecondary'}>
                <When time={confirmation.confirmedAt}/> · {confirmation.login}
            </Typography>)}
    </>;
};

/**
 * Profile check (#139): what is missing or outdated, each with a jump to where it is edited. Admins see the same,
 * plus the log of confirmations.
 */
export const ProfileCheckDashboardElement = (props: { initials: string }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const isAdmin = useSelector((state: ApplicationState) => state.adminReducer.loginStatus === LoginStatus.SUCCESS);
    const [check, setCheck] = useState<ProfileCheck | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        let current = true;
        setCheck(null);
        ProfileServiceClient.instance().getProfileCheck(props.initials)
            .then(result => current && setCheck(result))
            .catch(() => current && setCheck(null));
        return () => {
            current = false;
        };
    }, [props.initials]);

    if (!check) {
        // Loading, or the check failed: the other cards are enough then
        return null;
    }

    const outdated = check.hints.some(hint => hint.type === ProfileCheckHintType.OUTDATED);
    const iconClass = (type: ProfileCheckHintType) => type === ProfileCheckHintType.MISSING
        ? classes.missing
        : type === ProfileCheckHintType.OUTDATED ? classes.outdated : classes.neutral;

    const confirm = () => ProfileServiceClient.instance().confirmProfile(props.initials)
        .then(result => {
            setConfirmOpen(false);
            setCheck(result);
            Alerts.showSuccess(PowerLocalize.get('ProfileCheck.Confirmed'));
        })
        .catch(() => setConfirmOpen(false));

    return <Paper className={'dashboard-element ' + classes.card}>
        <Typography className={classes.title}>{PowerLocalize.get('ProfileCheck.Title')}</Typography>
        {check.hints.length === 0
            ? <>
                <PwrSpacer size="tight"/>
                <PwrRow>
                    <Icon className={'material-icons ' + classes.neutral}>verified</Icon>
                    <Typography>{PowerLocalize.get('ProfileCheck.AllGood')}</Typography>
                </PwrRow>
            </>
            : <List dense>
                {check.hints.map((hint, index) =>
                    <ListItem key={index} button className={classes.hint}
                              onClick={() => dispatch(NavigationActionCreator.AsyncNavigateTo(hintLink(hint, props.initials)))}>
                        <ListItemIcon className={classes.icon}>
                            <Tooltip title={PowerLocalize.get('ProfileCheck.Type.' + hint.type)}>
                                <Icon className={'material-icons ' + iconClass(hint.type)}>{hintIcon(hint.type)}</Icon>
                            </Tooltip>
                        </ListItemIcon>
                        {/* The fuzzy time is in the text, the exact time in the tooltip */}
                        <Tooltip title={hint.since ? formatToNumericDateTime(new Date(hint.since)) : ''}>
                            <ListItemText primary={hintText(hint)}/>
                        </Tooltip>
                        <Icon className={'material-icons ' + classes.neutral}>chevron_right</Icon>
                    </ListItem>)}
            </List>}
        <Typography variant={'body2'} color={'textSecondary'}>
            {PowerLocalize.get('ProfileCheck.LastEdited')} <When time={check.lastEdited}/>
            {check.lastConfirmed && <> · {PowerLocalize.get('ProfileCheck.LastConfirmed')} <When time={check.lastConfirmed}/></>}
        </Typography>
        {outdated && <>
            <PwrSpacer size="tight"/>
            {/* Only when something is outdated: confirming resets just those periods, and it is logged */}
            <Tooltip title={PowerLocalize.get('ProfileCheck.Confirm.Hint')}>
                <span>
                    <PwrButton color={'primary'} text={PowerLocalize.get('ProfileCheck.Confirm')}
                               icon={<Icon className="material-icons">task_alt</Icon>} onClick={() => setConfirmOpen(true)}/>
                </span>
            </Tooltip>
            {/* Asks first, like deleting: the confirmation is logged and silences the outdated hints for a while */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth={'sm'}>
                <DialogTitle>{PowerLocalize.get('ProfileCheck.Confirm.Title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{PowerLocalize.get('ProfileCheck.Confirm.Content')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <PwrConfirmActions confirmText={PowerLocalize.get('ProfileCheck.Confirm.Action')} onConfirm={confirm}
                                       onReject={() => setConfirmOpen(false)}/>
                </DialogActions>
            </Dialog>
        </>}
        {isAdmin && <ConfirmationLog initials={props.initials} check={check}/>}
    </Paper>;
};
