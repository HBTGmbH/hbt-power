import * as React from 'react';
import {useEffect, useState} from 'react';
import {
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
import {formatToFullLocalizedDateTime} from '../../utils/DateUtil';

const COMMIT_URL = 'https://github.com/HBTGmbH/hbt-power/commit/';

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

const ComponentRow = (props: { info: ComponentInfo }) => {
    const {info} = props;
    if (!info.available) {
        return <TableRow>
            <TableCell>{info.name}</TableCell>
            <TableCell colSpan={3}>
                <Typography color={'textSecondary'} variant={'body2'}>{PowerLocalize.get('AppInfo.Unavailable')}</Typography>
            </TableCell>
        </TableRow>;
    }
    return <TableRow>
        <TableCell>{info.name}</TableCell>
        <TableCell>{info.version || '–'}</TableCell>
        <TableCell>
            {info.commitId
                ? <Link href={COMMIT_URL + info.commitId} target={'_blank'} rel={'noopener noreferrer'}>
                    <span style={{fontFamily: 'monospace'}}>{info.commitId}</span>
                </Link>
                : '–'}
        </TableCell>
        <TableCell>{info.commitTime ? formatToFullLocalizedDateTime(info.commitTime) : '–'}</TableCell>
    </TableRow>;
};

const AppInfoDialog = (props: { open: boolean, onClose(): void }) => {
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
            <Typography variant={'subtitle2'} style={{marginTop: '16px'}}>{PowerLocalize.get('AppInfo.Components')}</Typography>
            {!components
                ? <Typography color={'textSecondary'}>{PowerLocalize.get('AppInfo.Loading')}</Typography>
                : <Table size={'small'}>
                    <TableHead>
                        <TableRow>
                            <TableCell>{PowerLocalize.get('AppInfo.Component')}</TableCell>
                            <TableCell>{PowerLocalize.get('AppInfo.Version')}</TableCell>
                            <TableCell>{PowerLocalize.get('AppInfo.Commit')}</TableCell>
                            <TableCell>{PowerLocalize.get('AppInfo.CommitTime')}</TableCell>
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
 * Info icon for the app bar: shows who is logged in, and version and commit of every component
 */
export const AppInfoButton = () => {
    const [open, setOpen] = useState(false);
    return <>
        <Tooltip title={PowerLocalize.get('AppInfo.Tooltip')}>
            <IconButton style={{color: 'white'}} aria-label={PowerLocalize.get('AppInfo.Tooltip')} onClick={() => setOpen(true)}>
                <Icon className="material-icons">info_outline</Icon>
            </IconButton>
        </Tooltip>
        <AppInfoDialog open={open} onClose={() => setOpen(false)}/>
    </>;
};
