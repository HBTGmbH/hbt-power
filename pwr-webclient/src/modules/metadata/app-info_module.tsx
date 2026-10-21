import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    Avatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Icon,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {PwrButton} from '../general/pwr-button';
import {AppInfoClient} from '../../clients/AppInfoClient';
import {ComponentInfo} from '../../model/metadata/ComponentInfo';
import {OIDCService} from '../../OIDCService';
import {formatToNumericDateTime, formatToRelativeTime} from '../../utils/DateUtil';

const COMMIT_URL = 'https://github.com/HBTGmbH/hbt-power/commit/';
// Flush with the headings above; the dialog fits a phone that way (#121)
const FIRST_COLUMN = {paddingLeft: 0};

const LoggedIn = () => {
    const account = OIDCService.instance().getCurrentAccount();
    if (!account) {
        return <Typography>{PowerLocalize.get('AppInfo.NotLoggedIn')}</Typography>;
    }
    return <>
        <Typography>
            {account.name}{account.username ? ' (' + account.username + ')' : ''}
        </Typography>
        <Typography color={'textSecondary'}>
            {PowerLocalize.get('AppInfo.Roles')}: {account.roles.length > 0 ? account.roles.join(', ') : '–'}
        </Typography>
    </>;
};

/**
 * Fuzzy time reads faster ("vor 3 Stunden"); the exact time is in the tooltip (#121)
 */
const CommitTime = (props: { info: ComponentInfo }) => {
    if (!props.info.commitTime) {
        return null;
    }
    return <Tooltip title={formatToNumericDateTime(props.info.commitTime)}>
        <Typography color={'textSecondary'} variant={'body2'} style={{whiteSpace: 'nowrap'}} component={'span'}>
            {formatToRelativeTime(props.info.commitTime)}
        </Typography>
    </Tooltip>;
};

const ComponentRow = (props: { info: ComponentInfo }) => {
    const {info} = props;
    if (!info.available) {
        return <TableRow>
            <TableCell style={FIRST_COLUMN}>{info.name}</TableCell>
            <TableCell>
                <Typography color={'textSecondary'} variant={'body2'}>{PowerLocalize.get('AppInfo.Unavailable')}</Typography>
            </TableCell>
            <TableCell className="pwr-only-wide"/>
        </TableRow>;
    }
    return <TableRow>
        <TableCell style={FIRST_COLUMN}>{info.name}</TableCell>
        <TableCell>
            {info.commitId
                ? <Link href={COMMIT_URL + info.commitId} target={'_blank'} rel={'noopener noreferrer'}>
                    <span style={{fontFamily: 'monospace'}}>{info.commitId}</span>
                </Link>
                : '–'}
            {/* Narrow screens: the time below the commit, so two columns fit on a phone (#121) */}
            <div className="pwr-only-narrow"><CommitTime info={info}/></div>
        </TableCell>
        {/* Wide screens: the time in a column of its own */}
        <TableCell className="pwr-only-wide"><CommitTime info={info}/></TableCell>
    </TableRow>;
};

/**
 * Who is logged in, and the commit of every component. Opened by the info icon, on narrow screens by the menu (#127)
 */
export const AppInfoDialog = (props: { open: boolean, onClose(): void }) => {
    const [components, setComponents] = useState<Array<ComponentInfo> | null>(null);

    // Loaded on every opening: after a deployment it shows what runs now
    useEffect(() => {
        if (!props.open) {
            return undefined;
        }
        let current = true;
        setComponents(null);
        AppInfoClient.instance().getComponentInfos().then(infos => current && setComponents(infos));
        return () => {
            current = false;
        };
    }, [props.open]);

    return <Dialog open={props.open} onClose={props.onClose} maxWidth={'md'}>
        <DialogTitle>{PowerLocalize.get('AppInfo.Title')}</DialogTitle>
        <DialogContent>
            <Typography variant={'subtitle2'}>{PowerLocalize.get('AppInfo.LoggedIn')}</Typography>
            <LoggedIn/>
            {!components
                ? <Typography color={'textSecondary'}>{PowerLocalize.get('AppInfo.Loading')}</Typography>
                : <Table size={'small'} style={{marginTop: '16px'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell style={FIRST_COLUMN}>{PowerLocalize.get('AppInfo.Component')}</TableCell>
                            <TableCell>{PowerLocalize.get('AppInfo.Commit')}</TableCell>
                            <TableCell className="pwr-only-wide">{PowerLocalize.get('AppInfo.CommitTime')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {components.map(info => <ComponentRow key={info.name} info={info}/>)}
                    </TableBody>
                </Table>}
        </DialogContent>
        <DialogActions>
            <PwrButton color={'primary'} text={PowerLocalize.get('Action.Close')} onClick={props.onClose}/>
        </DialogActions>
    </Dialog>;
};

/**
 * Info icon for the app bar: shows who is logged in, and the commit of every component
 */
export const AppInfoButton = () => {
    const [open, setOpen] = useState(false);
    return <>
        <Tooltip title={PowerLocalize.get('AppInfo.Tooltip')}>
            <IconButton className="pwr-app-info-button" style={{color: 'white'}} aria-label={PowerLocalize.get('AppInfo.Tooltip')}
                        onClick={() => setOpen(true)}>
                <Icon className="material-icons">info_outline</Icon>
            </IconButton>
        </Tooltip>
        <AppInfoDialog open={open} onClose={() => setOpen(false)}/>
    </>;
};

/**
 * Initials of an account name: "Klaus Richarz" and "Richarz, Klaus" both become "KR"
 */
export function accountInitials(name: string): string {
    const trimmed = (name || '').trim();
    const ordered = trimmed.includes(',') ? trimmed.split(',').reverse().join(' ') : trimmed;
    const words = ordered.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) {
        return '?';
    }
    const letters = words.length === 1 ? words[0][0] : words[0][0] + words[words.length - 1][0];
    return letters.toUpperCase();
}

/**
 * The logged in account for the app bar. Not the opened profile: which consultant belongs to an account is unknown.
 */
export const LoggedInUserAvatar = () => {
    const account = OIDCService.instance().getCurrentAccount();
    if (!account) {
        return null;
    }
    const title = PowerLocalize.get('Toolbar.LoggedInAs') + ' ' + account.name
        + (account.username ? ' (' + account.username + ')' : '');
    return <Tooltip title={title}>
        <Avatar className="pwr-logged-in-avatar" role={'img'} aria-label={title}>{accountInitials(account.name)}</Avatar>
    </Tooltip>;
};
