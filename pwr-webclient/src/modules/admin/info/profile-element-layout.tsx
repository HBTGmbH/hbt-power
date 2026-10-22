import * as React from 'react';
import {PropsWithChildren} from 'react';
import {Paper, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {PwrListTable} from '../../general/pwr-list-table';
import {PwrSpacer} from '../../general/pwr-spacer_module';

const useStyles = makeStyles(theme => ({
    layout: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: theme.spacing(2),
        alignItems: 'start',
        [theme.breakpoints.down('sm')]: {
            gridTemplateColumns: 'minmax(0, 1fr)',
        },
    },
    filter: {
        // The edge of the field in line with the text of the rows
        padding: theme.spacing(2, 1),
    },
    info: {
        padding: theme.spacing(2),
        // Stays in view while the list scrolls, below the app bar; scrolls itself if it is higher than the window
        [theme.breakpoints.up('md')]: {
            position: 'sticky',
            top: 64 + theme.spacing(2),
            maxHeight: 'calc(100vh - ' + (64 + theme.spacing(4)) + 'px)',
            overflowY: 'auto',
        },
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
    },
    name: {
        overflowWrap: 'anywhere',
    },
    usedBy: {
        // The text of the rows in line with the heading
        margin: theme.spacing(0, -1),
    },
}));

interface ProfileElementLayoutProps {
    /** Above the list, e.g. the search or the type */
    filter: React.ReactNode;
    list: React.ReactNode;
    info: React.ReactNode;
}

/**
 * Page of a tab of the profile elements (#199): the list with its filter on the left, the info box of the selected
 * entry on the right; on narrow screens the info box below the list.
 */
export const ProfileElementLayout = (props: ProfileElementLayoutProps) => {
    const classes = useStyles();
    return <div className={classes.layout}>
        <Paper>
            <div className={classes.filter}>{props.filter}</div>
            {props.list}
        </Paper>
        <Paper className={classes.info}>{props.info}</Paper>
    </div>;
};

interface ProfileElementInfoProps {
    /** Without, the box asks to select an entry */
    name?: string;
    /** Next to the name, e.g. merging a skill */
    action?: React.ReactNode;
    /** Undefined while loading */
    usedBy?: Array<ConsultantInfo>;
}

const byName = (a: ConsultantInfo, b: ConsultantInfo) =>
    (a.lastName() + ' ' + a.firstName()).localeCompare(b.lastName() + ' ' + b.firstName());

/**
 * Info box of a profile element (#199): the name as heading, whatever the type adds, and the consultants using it
 */
export const ProfileElementInfo = (props: PropsWithChildren<ProfileElementInfoProps>) => {
    const classes = useStyles();
    if (!props.name) {
        return <Typography variant="body2" color="textSecondary">
            {PowerLocalize.get('AdminClient.Overview.Info.NothingSelected')}
        </Typography>;
    }
    return <>
        <div className={classes.header}>
            <Typography variant="h6" component="h2" className={classes.name}>{props.name}</Typography>
            {props.action}
        </div>
        {props.children}
        {props.usedBy && <>
            <PwrSpacer size="field"/>
            <div className={classes.usedBy}>
                <PwrListTable label={PowerLocalize.get('AdminClient.Overview.Info.UsedBy')}
                              items={[...props.usedBy].sort(byName)}
                              itemKey={consultant => consultant.initials()}
                              emptyText={PowerLocalize.get('AdminClient.Overview.Info.UsedByNobody')}
                              columns={[
                                  {
                                      header: PowerLocalize.getFormatted('AdminClient.Overview.Info.UsedByCount', props.usedBy.length),
                                      render: consultant => consultant.firstName() + ' ' + consultant.lastName()
                                  },
                                  {
                                      header: PowerLocalize.get('AdminClient.Overview.Info.Initials'),
                                      render: consultant => consultant.initials(),
                                      width: 64
                                  }
                              ]}/>
            </div>
        </>}
    </>;
};
