import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {ReportData} from '../../../model/view/ReportData';
import {ReportAsyncActionCreator} from '../../../reducers/report/ReportAsyncActionCreator';
import {Icon, Paper, Table} from '@material-ui/core';

import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Button from '@material-ui/core/Button';
import {Build, ErrorOutline} from '@material-ui/icons';
import {Template} from '../../../model/view/Template';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';

interface ReportHistoryLocalProps {
}

interface ReportHistoryDispatch {
    loadAllReportData(initials: string): void,
    loadAllTemplateData() : void,
    getReportFile(id): void,
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

class ReportHistoryModule extends React.Component<ReportHistoryProps
    & ReportHistoryLocalProps
    & ReportHistoryDispatch, ReportHistoryState> {


    constructor(props: ReportHistoryProps & ReportHistoryLocalProps & ReportHistoryDispatch) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: ReportHistoryLocalProps): ReportHistoryProps {
        const templates = state.templateSlice.templates() != null ? state.templateSlice.templates() : new Map<string, Template>();
        const reports = state.reportStore.reports != null ? state.reportStore.reports : [];
        const initials = state.profileStore.consultant.initials != null ? state.profileStore.consultant.initials : '';

        return {
            initials: initials,
            reports: reports,
            templates: templates
        } as ReportHistoryProps;
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportHistoryDispatch {
        return {
            loadAllReportData: (initials: string) => dispatch(ReportAsyncActionCreator.loadAllReportData(initials)),
            loadAllTemplateData: () => dispatch(TemplateActionCreator.AsyncLoadAllFiles),
            getReportFile: (id) => dispatch(ReportAsyncActionCreator.getReportFile(id)),
            deleteReportFile: (id, cb) => dispatch(ReportAsyncActionCreator.deleteReportFile(id, cb))
        };
    }

    componentWillMount() {
       this.loadAllData();
    };

    private loadAllData() {
        if (this.props.templates == null || this.props.templates.size == 0) {
            this.loadAllTemplateData();
        }
        this.loadAllReportData();

    }

    /*private initInitials = () => {
        if (this.props.initials == null || this.props.initials == "") {
            this.props.initials = store.initials;
        }
    }*/

    private loadAllReportData = () => {
        if (this.props.initials != null && this.props.initials != "") { // TODO reload initials
            this.props.loadAllReportData(this.props.initials);
        }
    };

    private loadAllTemplateData = () => {
        this.props.loadAllTemplateData();
    };

    private ReportDeleteButton = (props) => {
        return <Button
            style={{marginLeft: '8px', marginTop: '5px', backgroundColor: '#ff8e01'}}
            variant={'contained'}
            className="mui-margin pwr-btn-error"
            onMouseDown={() => { this.deleteReport(props.id); }}
        >
            <Icon className="material-icons">delete</Icon>
            {PowerLocalize.get('Action.Delete')}
        </Button>
    };

    private StatusDisplay = (props) => {
        const status = props.status;
        const id = props.id;
        switch(status) {
            case "DONE":
                return <div>
                    <Button
                        variant="contained"
                        color="primary" style={{marginLeft: '8px', marginTop: '5px'}}
                        onMouseDown={() => { this.downloadReport(id); }}
                    >
                        <Icon className="material-icons">get_app</Icon>
                        {PowerLocalize.get('Action.Download')}
                    </Button>
                    <this.ReportDeleteButton/>
                </div>;
            case "ERROR":
                return <ErrorOutline color="secondary"/>;
            case "RUNNING":
                return <Build color="secondary"/>;
            default:
                return status;
        }
    };

    downloadReport = (id: Number) => {
        return this.props.getReportFile(id.toString());
    };

    deleteReport = (id: Number) => {
        this.props.deleteReportFile(id.toString(), this.loadAllReportData);
    };

    getTemplateName = (idx: string) : string  => {
        const templates = this.props.templates;
        if (!isNullOrUndefined(templates)) {
            const template = templates.get(idx);
            if (!isNullOrUndefined(template)) {
                return template.name;
            }
        }
        return PowerLocalize.get('Report.UnknownTemplate');
    };

    render() {
        return (
            <div>
                <Paper className="mui-margin">
                    <Button
                        variant="contained"
                        color="secondary" style={{marginLeft: '8px', marginTop: '5px'}}
                        onMouseDown={() => { this.loadAllData();}}
                    >
                        <Icon className="material-icons">autorenew</Icon>
                        {PowerLocalize.get('Action.Update')}
                    </Button>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow key={-1}>
                                <TableCell>{PowerLocalize.get('Overview.ViewProfiles.Title')}</TableCell>
                                <TableCell align="left">{PowerLocalize.get('Report.Template')}</TableCell>
                                <TableCell align="left">{PowerLocalize.get('Report.CreateDate')}</TableCell>
                                <TableCell align="left">{PowerLocalize.get('Report.Status')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.props.reports.map((value, index) =>
                                    <TableRow key={index}>
                                        <TableCell>{value.viewProfileName}</TableCell>
                                        <TableCell align="left">{this.getTemplateName(value.templateId)}</TableCell>
                                        <TableCell align="left">{value.createDate}</TableCell>
                                        <TableCell align="left"><this.StatusDisplay status={value.reportStatus} id={value.id}/></TableCell>
                                    </TableRow>)
                            }
                        </TableBody>
                    </Table>
                </Paper>
            </div>
        );
    }

}

export const ReportHistory: React.ComponentClass<ReportHistoryLocalProps> = connect(ReportHistoryModule.mapStateToProps, ReportHistoryModule.mapDispatchToProps)(ReportHistoryModule);

