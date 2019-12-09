import {AbstractAction} from '../BaseActions';
import {ReportData} from '../../model/view/ReportData';
import {ActionType} from '../ActionType';

export interface ReportLoadAction extends AbstractAction {
    reports: ReportData[];
}

export function reportLoadAction(reports: ReportData[]): ReportLoadAction {
    return {
        type: ActionType.LoadReportsAction,
        reports: reports
    };
}
