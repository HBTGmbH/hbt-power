export interface ReportData {
    id: number;
    initials: string;
    viewProfileName: string;
    reportStatus: string;
    fileName: string;
    templateId: string;
    createDate: Date;
    /** null for reports created before the report service stored the time */
    createdAt?: Date;
}
