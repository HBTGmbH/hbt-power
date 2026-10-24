import * as React from 'react';
import {useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Icon, LinearProgress, Paper, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {HousekeepingFindings} from '../../../model/admin/HousekeepingFindings';
import {ProfileServiceClient} from '../../../clients/ProfileServiceClient';
import {ReportServiceClient} from '../../../clients/ReportServiceClient';
import {ViewProfileServiceClient} from '../../../clients/ViewProfileServiceClient';
import {PwrButton} from '../../general/pwr-button';
import {PwrListTable} from '../../general/pwr-list-table';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PwrConfirmActions} from '../../general/pwr-form-actions';
import {Alerts} from '../../../utils/Alerts';

interface HousekeepingClient {
    getHousekeeping(): Promise<Array<HousekeepingFindings>>;

    cleanHousekeeping(check: string): Promise<HousekeepingFindings>;
}

/** Every service reports and cleans the data it stores itself (#242); the page asks each one on its own */
const SERVICES: Array<{ key: string, client(): HousekeepingClient }> = [
    {key: 'profile', client: () => ProfileServiceClient.instance()},
    {key: 'report', client: () => ReportServiceClient.instance()},
    {key: 'viewProfile', client: () => ViewProfileServiceClient.instance()},
];

interface ServiceResult {
    loading: boolean;
    findings?: Array<HousekeepingFindings>;
    /** The service did not answer */
    failed?: boolean;
}

interface Selected {
    service: string;
    findings: HousekeepingFindings;
}

const useStyles = makeStyles(theme => ({
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
    },
    service: {
        padding: theme.spacing(2),
    },
    examples: {
        overflowWrap: 'anywhere',
    },
    error: {
        color: theme.palette.error.main,
    },
    clean: {
        color: theme.palette.error.main,
    },
}));

const checkTitle = (check: string) => PowerLocalize.get('AdminClient.Housekeeping.Check.' + check);
const checkDescription = (check: string) => PowerLocalize.get('AdminClient.Housekeeping.Check.' + check + '.Description');

/**
 * Finds data nothing points to any more and data that contradicts other data (#242), across the services: the data
 * is spread over several databases and some deletes are not transactional. Checks on request; cleaning asks once,
 * like deleting unused profile elements, and deletes only what is still left over.
 */
export const Housekeeping = () => {
    const classes = useStyles();
    const [results, setResults] = useState<{ [service: string]: ServiceResult }>({});
    const [selected, setSelected] = useState<Selected | null>(null);
    const [confirming, setConfirming] = useState(false);

    const setResult = (service: string, result: ServiceResult) =>
        setResults(previous => ({...previous, [service]: result}));

    const check = (service: typeof SERVICES[number]) => {
        setResult(service.key, {loading: true});
        service.client().getHousekeeping()
            .then(findings => setResult(service.key, {loading: false, findings}))
            .catch(error => {
                console.error(error);
                setResult(service.key, {loading: false, failed: true});
            });
    };

    const checkAll = () => SERVICES.forEach(check);

    const askToClean = (service: string, findings: HousekeepingFindings) => {
        setSelected({service, findings});
        setConfirming(true);
    };

    const clean = () => {
        setConfirming(false);
        const service = SERVICES.find(s => s.key === selected.service);
        const key = selected.findings.check;
        // The client shows an error; the service is checked again either way
        service.client().cleanHousekeeping(key)
            .then(cleaned => Alerts.showSuccess(PowerLocalize.getFormatted('AdminClient.Housekeeping.Clean.Success',
                checkTitle(key), cleaned.count)))
            .catch(console.error)
            .finally(() => check(service));
    };

    const renderExamples = (findings: HousekeepingFindings) => {
        if (findings.error) {
            // The technical message below, for whoever looks into it
            return <span className={classes.examples}>
                <span className={classes.error}>{PowerLocalize.get('AdminClient.Housekeeping.CheckFailed')}</span>
                <br/>
                <Typography variant="caption" color="textSecondary">{findings.error}</Typography>
            </span>;
        }
        if (findings.count === 0) {
            return PowerLocalize.get('AdminClient.Housekeeping.NoFindings');
        }
        const more = findings.count - findings.examples.length;
        return <span className={classes.examples}>
            {findings.examples.join(', ')}
            {more > 0 && ' ' + PowerLocalize.getFormatted('AdminClient.Housekeeping.More', more)}
        </span>;
    };

    const renderService = (service: typeof SERVICES[number]) => {
        const result = results[service.key];
        const name = PowerLocalize.get('AdminClient.Housekeeping.Service.' + service.key);
        return <React.Fragment key={service.key}>
            <PwrSpacer/>
            <Paper className={classes.service}>
                <Typography variant="h6" component="h2">{name}</Typography>
                <PwrSpacer size="tight"/>
                {!result && <Typography variant="body2" color="textSecondary">
                    {PowerLocalize.get('AdminClient.Housekeeping.NotChecked')}
                </Typography>}
                {result && result.loading && <LinearProgress/>}
                {result && result.failed && <Typography variant="body2" className={classes.error}>
                    {PowerLocalize.getFormatted('AdminClient.Housekeeping.ServiceFailed', name)}
                </Typography>}
                {result && result.findings && <PwrListTable
                    label={name}
                    items={result.findings}
                    itemKey={findings => findings.check}
                    columns={[
                        {
                            header: PowerLocalize.get('AdminClient.Housekeeping.Column.Check'),
                            render: findings => <>
                                <div>{checkTitle(findings.check)}</div>
                                <Typography variant="caption" color="textSecondary">
                                    {checkDescription(findings.check)}
                                </Typography>
                            </>
                        },
                        {
                            header: PowerLocalize.get('AdminClient.Housekeeping.Column.Count'), width: 64,
                            render: findings => findings.error ? '–' : findings.count
                        },
                        {
                            header: PowerLocalize.get('AdminClient.Housekeeping.Column.Examples'),
                            render: renderExamples
                        },
                        {
                            header: '', width: 140,
                            render: findings => <PwrButton color="default" className={classes.clean}
                                                           text={PowerLocalize.get('AdminClient.Housekeeping.Clean')}
                                                           icon={<Icon className="material-icons">delete_sweep</Icon>}
                                                           disabled={!!findings.error || findings.count === 0}
                                                           onClick={() => askToClean(service.key, findings)}/>
                        },
                    ]}/>}
            </Paper>
        </React.Fragment>;
    };

    const checking = SERVICES.some(service => results[service.key] && results[service.key].loading);
    return <div>
        <div className={classes.header}>
            <Typography variant="h5" component="h1">{PowerLocalize.get('AdminClient.Menu.Maintenance.Housekeeping')}</Typography>
            <PwrButton variant="contained" color="primary" text={PowerLocalize.get('AdminClient.Housekeeping.Check')}
                       icon={<Icon className="material-icons">refresh</Icon>} disabled={checking} onClick={checkAll}/>
        </div>
        <PwrSpacer size="tight"/>
        <Typography variant="body2">{PowerLocalize.get('AdminClient.Housekeeping.Intro')}</Typography>
        {SERVICES.map(renderService)}
        {/* Forgotten only once the dialog has faded out, so it shows the check until then */}
        <Dialog open={confirming} onClose={() => setConfirming(false)} fullWidth maxWidth="sm"
                TransitionProps={{onExited: () => setSelected(null)}}>
            {selected && <>
                <DialogTitle>{PowerLocalize.getFormatted('AdminClient.Housekeeping.Clean.Title',
                    checkTitle(selected.findings.check))}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        {PowerLocalize.getFormatted('AdminClient.Housekeeping.Clean.Content', selected.findings.count)}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <PwrConfirmActions destructive confirmText={PowerLocalize.get('AdminClient.Housekeeping.Clean')}
                                       onConfirm={clean} rejectText={PowerLocalize.get('Action.Cancel')}
                                       onReject={() => setConfirming(false)}/>
                </DialogActions>
            </>}
        </Dialog>
    </div>;
};
