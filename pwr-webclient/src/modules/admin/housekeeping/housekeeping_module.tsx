import * as React from 'react';
import {useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Icon, LinearProgress, Paper, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {HousekeepingFindings} from '../../../model/admin/HousekeepingFindings';
import {ProfileServiceClient} from '../../../clients/ProfileServiceClient';
import {ReportServiceClient} from '../../../clients/ReportServiceClient';
import {ViewProfileServiceClient} from '../../../clients/ViewProfileServiceClient';
import {SkillServiceClient} from '../../../clients/SkillServiceClient';
import {UnusedNameEntitiesDialog} from '../info/name-entity/name-entity-dialogs';
import {PwrButton} from '../../general/pwr-button';
import {PwrListTable} from '../../general/pwr-list-table';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PwrConfirmActions} from '../../general/pwr-form-actions';
import {Alerts} from '../../../utils/Alerts';

interface HousekeepingClient {
    getHousekeeping(): Promise<Array<HousekeepingFindings>>;

    cleanHousekeeping(check: string): Promise<HousekeepingFindings>;
}

interface Section {
    key: string;
    /** Localization key of a text below the name */
    description?: string;

    client(): HousekeepingClient;
}

/** Every service reports and cleans the data it stores itself (#242); the page asks each one on its own */
const LEFTOVERS: Array<Section> = [
    {key: 'profile', client: () => ProfileServiceClient.instance()},
    {key: 'report', client: () => ReportServiceClient.instance()},
    {key: 'viewProfile', client: () => ViewProfileServiceClient.instance()},
];

/**
 * Valid entries nobody uses any more (#288): deleting them is a decision of the admin, not a repair. The profile
 * elements are deleted through the dialog with all their names (UnusedNameEntitiesDialog)
 */
const UNUSED: Array<Section> = [
    {
        key: 'profileUnused', description: 'AdminClient.Housekeeping.Check.unused-name-entities.Description', client: () => ({
            getHousekeeping: () => ProfileServiceClient.instance().getUnusedHousekeeping(),
            cleanHousekeeping: () => Promise.reject(new Error('Deleted through UnusedNameEntitiesDialog')),
        })
    },
    {
        key: 'skillUnused', client: () => ({
            getHousekeeping: () => SkillServiceClient.instance().getUnusedHousekeeping(),
            cleanHousekeeping: check => SkillServiceClient.instance().cleanUnusedHousekeeping(check),
        })
    },
];

/** Data nobody probably needs any more (#289): deleting is a decision too; the newest of each consultant stays */
const OLD: Array<Section> = [
    {
        key: 'reportOld', client: () => ({
            getHousekeeping: () => ReportServiceClient.instance().getOldHousekeeping(),
            cleanHousekeeping: check => ReportServiceClient.instance().cleanOldHousekeeping(check),
        })
    },
    {
        key: 'viewProfileOld', client: () => ({
            getHousekeeping: () => ViewProfileServiceClient.instance().getOldHousekeeping(),
            cleanHousekeeping: check => ViewProfileServiceClient.instance().cleanOldHousekeeping(check),
        })
    },
];

const SECTIONS = [...LEFTOVERS, ...UNUSED, ...OLD];

/** "12,3 MB" */
const megabytes = (bytes: number) => (bytes / 1000000).toLocaleString('de-DE', {maximumFractionDigits: 1}) + ' MB';

const UNUSED_NAME_ENTITIES = 'unused-name-entities-';

/** The type of a check of unused profile elements, e.g. SECTOR */
const unusedNameEntityType = (check: string): string | null =>
    check.startsWith(UNUSED_NAME_ENTITIES) ? check.substring(UNUSED_NAME_ENTITIES.length) : null;

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

const checkTitle = (check: string) => {
    const type = unusedNameEntityType(check);
    return type ? PowerLocalize.get('NameEntityType.' + type) : PowerLocalize.get('AdminClient.Housekeeping.Check.' + check);
};
/** The unused profile elements share one description, above their list */
const checkDescription = (check: string) => unusedNameEntityType(check)
    ? null : PowerLocalize.get('AdminClient.Housekeeping.Check.' + check + '.Description');

/**
 * Finds data nothing points to any more and data that contradicts other data (#242), across the services: the data
 * is spread over several databases and some deletes are not transactional. Checks on request; cleaning asks once and
 * deletes only what is still left over. A second rubric lists valid entries nobody uses any more (#288).
 */
export const Housekeeping = () => {
    const classes = useStyles();
    const [results, setResults] = useState<{ [service: string]: ServiceResult }>({});
    const [selected, setSelected] = useState<Selected | null>(null);
    const [confirming, setConfirming] = useState(false);
    /** Type of the unused profile elements whose dialog is open */
    const [unusedType, setUnusedType] = useState<string | null>(null);

    const setResult = (service: string, result: ServiceResult) =>
        setResults(previous => ({...previous, [service]: result}));

    const check = (service: Section) => {
        setResult(service.key, {loading: true});
        service.client().getHousekeeping()
            .then(findings => setResult(service.key, {loading: false, findings}))
            .catch(error => {
                console.error(error);
                setResult(service.key, {loading: false, failed: true});
            });
    };

    const checkAll = () => SECTIONS.forEach(check);

    const askToClean = (service: string, findings: HousekeepingFindings) => {
        const type = unusedNameEntityType(findings.check);
        if (type) {
            setUnusedType(type);
            return;
        }
        setSelected({service, findings});
        setConfirming(true);
    };

    const clean = () => {
        setConfirming(false);
        const service = SECTIONS.find(s => s.key === selected.service);
        const key = selected.findings.check;
        // The client shows an error; the service is checked again either way
        service.client().cleanHousekeeping(key)
            .then(cleaned => Alerts.showSuccess(PowerLocalize.getFormatted(isDecision(selected)
                ? 'AdminClient.Housekeeping.Delete.Success' : 'AdminClient.Housekeeping.Clean.Success', checkTitle(key), cleaned.count)))
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

    const renderService = (service: Section, unused: boolean) => {
        const result = results[service.key];
        const name = PowerLocalize.get('AdminClient.Housekeeping.Service.' + service.key);
        return <React.Fragment key={service.key}>
            <PwrSpacer/>
            <Paper className={classes.service}>
                <Typography variant="subtitle1" component="h3">{name}</Typography>
                {service.description && <Typography variant="body2" color="textSecondary">
                    {PowerLocalize.get(service.description)}
                </Typography>}
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
                                {checkDescription(findings.check) && <Typography variant="caption" color="textSecondary">
                                    {checkDescription(findings.check)}
                                </Typography>}
                            </>
                        },
                        {
                            header: PowerLocalize.get('AdminClient.Housekeeping.Column.Count'), width: 64,
                            render: findings => findings.error ? '–' : <>
                                {findings.count}
                                {findings.bytes > 0 && <Typography variant="caption" color="textSecondary" component="div">
                                    {megabytes(findings.bytes)}
                                </Typography>}
                            </>
                        },
                        {
                            header: PowerLocalize.get('AdminClient.Housekeeping.Column.Examples'),
                            render: renderExamples
                        },
                        {
                            header: '', width: 140,
                            render: findings => <PwrButton color="default" className={classes.clean}
                                                           text={PowerLocalize.get(unused ? 'Action.Delete' : 'AdminClient.Housekeeping.Clean')}
                                                           icon={<Icon className="material-icons">delete_sweep</Icon>}
                                                           disabled={!!findings.error || findings.count === 0}
                                                           onClick={() => askToClean(service.key, findings)}/>
                        },
                    ]}/>}
            </Paper>
        </React.Fragment>;
    };

    /** Valid data nobody uses or needs: deleting is a decision, not a repair */
    const isDecision = (selection: Selected) => [...UNUSED, ...OLD].some(section => section.key === selection.service);

    const checking = SECTIONS.some(service => results[service.key] && results[service.key].loading);
    return <div>
        <div className={classes.header}>
            <Typography variant="h5" component="h1">{PowerLocalize.get('AdminClient.Menu.Maintenance.Housekeeping')}</Typography>
            <PwrButton variant="contained" color="primary" text={PowerLocalize.get('AdminClient.Housekeeping.Check')}
                       icon={<Icon className="material-icons">refresh</Icon>} disabled={checking} onClick={checkAll}/>
        </div>
        <PwrSpacer size="tight"/>
        <PwrSpacer/>
        <Typography variant="h6" component="h2">{PowerLocalize.get('AdminClient.Housekeeping.Leftovers')}</Typography>
        <Typography variant="body2">{PowerLocalize.get('AdminClient.Housekeeping.Intro')}</Typography>
        {LEFTOVERS.map(service => renderService(service, false))}
        <PwrSpacer size="section"/>
        <Typography variant="h6" component="h2">{PowerLocalize.get('AdminClient.Housekeeping.Unused')}</Typography>
        <Typography variant="body2">{PowerLocalize.get('AdminClient.Housekeeping.Unused.Intro')}</Typography>
        {UNUSED.map(service => renderService(service, true))}
        <PwrSpacer size="section"/>
        <Typography variant="h6" component="h2">{PowerLocalize.get('AdminClient.Housekeeping.Old')}</Typography>
        <Typography variant="body2">{PowerLocalize.get('AdminClient.Housekeeping.Old.Intro')}</Typography>
        {OLD.map(service => renderService(service, true))}
        <UnusedNameEntitiesDialog open={unusedType !== null} type={unusedType || ''}
                                  typeLabel={unusedType ? PowerLocalize.get('NameEntityType.' + unusedType) : ''}
                                  onClose={() => setUnusedType(null)}
                                  onDeleted={() => check(UNUSED[0])}/>
        {/* Forgotten only once the dialog has faded out, so it shows the check until then */}
        <Dialog open={confirming} onClose={() => setConfirming(false)} fullWidth maxWidth="sm"
                TransitionProps={{onExited: () => setSelected(null)}}>
            {selected && <>
                <DialogTitle>{PowerLocalize.getFormatted(isDecision(selected) ? 'AdminClient.Housekeeping.Delete.Title'
                    : 'AdminClient.Housekeeping.Clean.Title', checkTitle(selected.findings.check))}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        {PowerLocalize.getFormatted(isDecision(selected) ? 'AdminClient.Housekeeping.Delete.Content'
                            : 'AdminClient.Housekeeping.Clean.Content', selected.findings.count)}
                    </Typography>
                    {isDecision(selected) && <>
                        <PwrSpacer size="tight"/>
                        <Typography variant="body2">{renderExamples(selected.findings)}</Typography>
                    </>}
                </DialogContent>
                <DialogActions>
                    <PwrConfirmActions destructive confirmText={PowerLocalize.get(isDecision(selected) ? 'Action.Delete'
                        : 'AdminClient.Housekeeping.Clean')}
                                       onConfirm={clean} rejectText={PowerLocalize.get('Action.Cancel')}
                                       onReject={() => setConfirming(false)}/>
                </DialogActions>
            </>}
        </Dialog>
    </div>;
};
