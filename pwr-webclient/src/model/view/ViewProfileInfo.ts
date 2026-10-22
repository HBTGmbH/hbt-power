import {LocalDate} from '../../utils/DateUtil';

export class ViewProfileInfo {
    viewDescription: string;
    owner: string;
    consultantName: string;
    consultantBirthDate: LocalDate;
    name: string;
    creationDate: LocalDate;

    constructor(viewProfileInfo: ViewProfileInfo) {
        this.viewDescription = viewProfileInfo.viewDescription;
        this.owner = viewProfileInfo.owner;
        this.consultantName = viewProfileInfo.consultantName;
        this.consultantBirthDate = viewProfileInfo.consultantBirthDate;
        this.name = viewProfileInfo.name;
        this.creationDate = viewProfileInfo.creationDate;
    }
}