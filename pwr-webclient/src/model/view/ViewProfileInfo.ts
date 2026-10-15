export class ViewProfileInfo {
    viewDescription: string;
    owner: string;
    consultantName: string;
    consultantBirthDate: Date;
    name: string;
    creationDate: Date;
    charsPerLine: number;

    constructor(viewProfileInfo: ViewProfileInfo) {
        this.viewDescription = viewProfileInfo.viewDescription;
        this.owner = viewProfileInfo.owner;
        this.consultantName = viewProfileInfo.consultantName;
        this.consultantBirthDate = new Date(viewProfileInfo.consultantBirthDate);
        this.name = viewProfileInfo.name;
        this.creationDate = new Date(viewProfileInfo.creationDate);
        this.charsPerLine = viewProfileInfo.charsPerLine;
    }
}