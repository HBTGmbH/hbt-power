import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {ReportData} from '../../../model/view/ReportData';
import {ReportAsyncActionCreator} from '../../../reducers/report/ReportAsyncActionCreator';
import {Paper} from '@material-ui/core';

interface ReportHistoryLocalProps {
}

interface ReportHistoryDispatch {
    loadAllReportData(initials: string): void,
}

interface ReportHistoryProps {
    initials: string;
    reports: ReportData[];
}


interface ReportHistoryState {

}

class ReportHistoryModule extends React.Component<ReportHistoryProps
    & ReportHistoryLocalProps
    & ReportHistoryDispatch, ReportHistoryState> {


    constructor(props: ReportHistoryProps & ReportHistoryLocalProps & ReportHistoryDispatch) {
        super(props);

    }

    static mapStateToProps(state: ApplicationState, localProps: ReportHistoryLocalProps): ReportHistoryProps {
        const reports = state.reportStore.reports != null ? state.reportStore.reports : [];
        const initials = state.profileStore.consultant.initials != null ? state.profileStore.consultant.initials : '';
        return {
            initials: initials,
            reports: reports
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportHistoryDispatch {
        return {
            loadAllReportData: (initials: string) => dispatch(ReportAsyncActionCreator.loadAllReportData(initials))
        };
    }

    componentWillMount() {
        if (this.props.reports == null || this.props.reports.length == 0) {
            this.loadAllReportData();
        }
    }


    private loadAllReportData = () => {
        if (this.props.initials != null && this.props.initials != "") { // TODO reload initials
            this.props.loadAllReportData(this.props.initials);
            console.log("load All Report Data")
        }
    };


    render() {
        return (
            <div>
                <Paper className="mui-margin">
                {
                    this.props.reports.map((value, index) => <div key={index}> {value.fileName}</div>)
                }
                </Paper>
            </div>
        );
    }

}

export const ReportHistory: React.ComponentClass<ReportHistoryLocalProps> = connect(ReportHistoryModule.mapStateToProps, ReportHistoryModule.mapDispatchToProps)(ReportHistoryModule);

