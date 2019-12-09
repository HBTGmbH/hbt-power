import {emptyStore, ReportStore} from './ReportStore';
import {AbstractAction} from '../BaseActions';
import {ActionType} from '../ActionType';
import {ReportLoadAction} from './ReportActions';
import {ReportData} from '../../model/view/ReportData';


export function reduceReports(store: ReportStore = emptyStore, action: AbstractAction): ReportStore {
    switch (action.type) {
        case ActionType.ResetReportStore: {
            return emptyStore;
        }
        case ActionType.LoadReportsAction: {
            const act = action as ReportLoadAction;
            return replaceReports(store, act.reports);
        }
    }

    return store;
}

function replaceReports(store: ReportStore, reports: ReportData[]): ReportStore {
    return {...store, reports: reports};
}
