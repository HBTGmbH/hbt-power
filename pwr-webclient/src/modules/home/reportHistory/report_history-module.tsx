import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {connect} from 'react-redux';
import {ReportData} from '../../../model/view/ReportData';
import {ReportAsyncActionCreator} from '../../../reducers/report/ReportAsyncActionCreator';
import {CircularProgress, Icon, Paper, Table, Tooltip} from '@material-ui/core';

import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import {PwrButton} from '../../general/pwr-button';
import {PwrIconButton} from '../../general/pwr-icon-button';
import {ErrorOutline} from '@material-ui/icons';
import {Template} from '../../../model/view/Template';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ThunkDispatch} from 'redux-thunk';
import {formatFullLocalizedDate, formatToFullLocalizedDateTime} from '../../../utils/DateUtil';

interface ReportHistoryLocalProps {
}

interface ReportHistoryDispatch {
    loadAllReportData(initials: string): void,

    pollReportData(initials: string): void,

    loadAllTemplateData(): void,

    getReportFile(reportData: ReportData): void,

    deleteReportFile(id, cb): void
}

interface ReportHistoryProps {
    initials: string;
    reports: ReportData[];
    templates: Map<string, Template>;
}


interface ReportHistoryState {
    initials: string;
}

/** While a report is being created ('RUNNING'), the list is reloaded at this interval */
const POLL_INTERVAL_MS = 3000;
/** Polling stops after this time, so a report stuck in 'RUNNING' (e.g. the service restarted) is not polled forever */
const POLL_DURATION_MS = 5 * 60 * 1000;

class ReportHistoryModule extends React.Component<ReportHistoryProps
    & ReportHistoryLocalProps
    & ReportHistoryDispatch, ReportHistoryState> {

    private pollTimer: ReturnType<typeof setInterval> | undefined;
    private pollUntil = 0;

    constructor(props: ReportHistoryProps & ReportHistoryLocalProps & ReportHistoryDispatch) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState): ReportHistoryProps {
        const templates = state.templateSlice.templates != null ? state.templateSlice.templates : new Map<string, Template>();
        const reports = state.reportStore.reports != null ? state.reportStore.reports : [];
        const initials = state.profileStore.consultant.initials != null ? state.profileStore.consultant.initials : '';

        return {
            initials: initials,
            reports: reports,
            templates: templates
        } as ReportHistoryProps;
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ReportHistoryDispatch {
        return {
            loadAllReportData: (initials: string) => dispatch(ReportAsyncActionCreator.loadAllReportData(initials)),
            pollReportData: (initials: string) => dispatch(ReportAsyncActionCreator.pollReportData(initials)),
            loadAllTemplateData: () => dispatch(TemplateActionCreator.AsyncLoadAllTemplates()),
            getReportFile: (reportData: ReportData) => dispatch(ReportAsyncActionCreator.getReportFile(reportData)),
            deleteReportFile: (id, cb) => dispatch(ReportAsyncActionCreator.deleteReportFile(id, cb))
        };
    }

    componentDidMount() {
        this.loadAllData();
        this.pollUntil = Date.now() + POLL_DURATION_MS;
        this.pollTimer = setInterval(this.pollWhileRunning, POLL_INTERVAL_MS);
    };

    componentWillUnmount() {
        clearInterval(this.pollTimer);
    }

    private pollWhileRunning = () => {
        if (Date.now() > this.pollUntil) {
            clearInterval(this.pollTimer);
            return;
        }
        const running = this.props.reports.some(report => report.reportStatus === 'RUNNING');
        if (running && this.props.initials) {
            this.props.pollReportData(this.props.initials);
        }
    };

    componentDidUpdate(prevProps: Readonly<ReportHistoryProps>) {
        if (prevProps.initials !== this.props.initials) {
            this.loadAllReportData();
        }
    }

    private loadAllData() {
        if (!this.props.templates || this.props.templates.size === 0) {
            this.loadAllTemplateData();
        }
        this.loadAllReportData();

    }

    private loadAllReportData = () => {
        if (this.props.initials != null && this.props.initials != '') {
            this.props.loadAllReportData(this.props.initials);
        }
    };

    private loadAllTemplateData = () => {
        this.props.loadAllTemplateData();
    };


    private StatusDisplay = (reportData: ReportData) => {
        const statusStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center'};
        let body: JSX.Element;
        const status = reportData.reportStatus;

        switch (status) {
            case 'DONE':
                body =
                    <PwrButton color="primary" text={PowerLocalize.get('Action.Download')}
                               icon={<Icon className="material-icons">get_app</Icon>}
                               onClick={() => this.downloadReport(reportData)}/>;
                break;
            case 'ERROR':
                body =
                    <Tooltip title={PowerLocalize.get('Report.Status.Error.Hint')}>
                        <span className="error-text" style={statusStyle}>
                            <ErrorOutline style={{color: 'inherit', marginRight: '4px'}}/>
                            {PowerLocalize.get('Report.Status.Error')}
                        </span>
                    </Tooltip>;
                break;
            case 'RUNNING':
                body =
                    <span style={statusStyle}>
                        <CircularProgress size={20} style={{marginRight: '8px'}}/>
                        {PowerLocalize.get('Report.Status.Running')}
                    </span>;
                break;
            default:
                body = <span>{status}</span>;
                break;
        }
        return body;
    };

    downloadReport = (reportData: ReportData) => {
        return this.props.getReportFile(reportData);
    };

    downloadReportURL = (reportData: ReportData) => {
        return this.props.getReportFile(reportData);
    };

    deleteReport = (id: number) => {
        this.props.deleteReportFile(id.toString(), this.loadAllReportData);
    };

    getTemplateName = (idx: string): string => {
        const templates = this.props.templates;
        if (!templates) {
            return PowerLocalize.get('Report.UnknownTemplate');
        }
        const template = templates.get(idx);
        if (!template) {
            return PowerLocalize.get('Report.UnknownTemplate');
        }
        return template.name;
    };

    render() {
        return (
            <div>
                {/* No refresh button: the list reloads itself while a report is being created */}
                <Paper className="mui-margin">
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow key={-1}>
                                <TableCell>{PowerLocalize.get('Report.ViewProfile')}</TableCell>
                                <TableCell align="left">{PowerLocalize.get('Report.Template')}</TableCell>
                                <TableCell align="left">{PowerLocalize.get('Report.CreateDate')}</TableCell>
                                <TableCell align="left">{PowerLocalize.get('Report.Status')}</TableCell>
                                <TableCell/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.props.reports.map((value, index) =>
                                    <TableRow key={index}>
                                        <TableCell>{value.viewProfileName}</TableCell>
                                        <TableCell align="left">{this.getTemplateName(value.templateId)}</TableCell>
                                        <TableCell align="left">{value.createdAt ? formatToFullLocalizedDateTime(value.createdAt) : formatFullLocalizedDate(value.createDate)}</TableCell>
                                        <TableCell
                                            align="left">{this.StatusDisplay(value)}</TableCell>
                                        {/* An icon in a column of its own: in a list of many documents a button per row would dominate (#41) */}
                                        <TableCell align="right" padding="checkbox">
                                            <PwrIconButton iconName="delete" tooltip={PowerLocalize.get('Action.Delete')}
                                                           onClick={() => this.deleteReport(value.id)}/>
                                        </TableCell>
                                    </TableRow>)
                            }
                        </TableBody>
                    </Table>
                </Paper>
            </div>
        );
    }

}

export const ReportHistory = connect(ReportHistoryModule.mapStateToProps, ReportHistoryModule.mapDispatchToProps)(ReportHistoryModule);

