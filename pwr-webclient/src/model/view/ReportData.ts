export interface ReportData {
    id: number;
    initials: string;
    viewProfileName: string;
    /** The description of the view profile at the time of the export (#214); null for older reports */
    viewProfileDescription?: string | null;
    /** Who started the export (#214), from the headers of the edge; null for older reports and locally */
    exportedByInitials?: string | null;
    /** Their name at the time of the export */
    exportedByName?: string | null;
    reportStatus: string;
    fileName: string;
    templateId: string;
    createDate: Date;
    /** null for reports created before the report service stored the time */
    createdAt?: Date;
}
