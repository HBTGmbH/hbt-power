export class ReportPreviewFile {
    id: string;
    templateId: string;
    filename: string;
    content: string;
    file:any;


    constructor(reportPreview: ReportPreviewFile) {
        this.id = reportPreview.id;
        this.templateId = reportPreview.templateId;
        this.filename = reportPreview.filename;
        this.content = reportPreview.content;
        this.file =reportPreview.file;

    }
}