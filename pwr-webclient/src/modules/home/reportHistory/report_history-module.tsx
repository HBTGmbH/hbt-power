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
import {Build, ErrorOutline, DeleteOutline} from '@material-ui/icons';
import {Template} from '../../../model/view/Template';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

interface ReportHistoryLocalProps {
}

interface ReportHistoryDispatch {
    loadAllReportData(initials: string): void,
    loadAllTemplateData() : void,
    getReportFile(id): void,
    deleteReportFile(id): void
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
            deleteReportFile: (id) => dispatch(ReportAsyncActionCreator.deleteReportFile(id))
        };
    }

    componentWillMount() {
       this.loadAllData();
    };

    private loadAllData() {
        console.log("Possibly want to load templates");
        console.log("But templates are " + this.props.templates + " and this big " + this.props.templates.size + "");
        if (this.props.templates == null || this.props.templates.size == 0) {
            console.log("Want to load templates");
            this.loadAllTemplateData();
        }

        console.log("Possibly want to load Reports");
        console.log("Reports are " + this.props.reports + " and this big " + this.props.reports.length + "");
        this.loadAllReportData();

    }


    private loadAllReportData = () => {
        console.log("Trying to load all report data");
        if (this.props.initials != null && this.props.initials != "") { // TODO reload initials
            this.props.loadAllReportData(this.props.initials);
            console.log("load All Report Data");
        }
    };

    private loadAllTemplateData = () => {
        this.props.loadAllTemplateData();
        console.log("load All Template Data");
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
                    <Button
                        style={{marginLeft: '8px', marginTop: '5px', backgroundColor: '#ff8e01'}}
                        variant={'contained'}
                        className="mui-margin pwr-btn-error"
                        onMouseDown={() => { this.deleteReport(id); }}
                    >
                        <Icon className="material-icons">delete</Icon>
                        {PowerLocalize.get('Action.Delete')}
                    </Button>
                </div>;
            case "ERROR":
                return <ErrorOutline color="secondary"></ErrorOutline>;
            case "RUNNING":
                return <Build color="secondary"></Build>;
            default:
                return status;
        }
    };

    downloadReport = (id: Number) => {
        return this.props.getReportFile(id.toString());
    };

    deleteReport = (id: Number) => {
        console.log("DELETE");
        this.props.deleteReportFile(id.toString());
        this.loadAllReportData();
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
                                        <TableCell align="left">{this.props.templates.get(value.templateId).name}</TableCell>
                                        <TableCell align="left">{value.createDate}</TableCell>
                                        <TableCell align="left"><this.StatusDisplay status={value.reportStatus} id={value.id}></this.StatusDisplay></TableCell>
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

