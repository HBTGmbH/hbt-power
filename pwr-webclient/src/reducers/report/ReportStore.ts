import {ReportData} from '../../model/view/ReportData';

export interface ReportStore {
    reports : ReportData[]
}

export const emptyStore: ReportStore = {
    reports : []
};
