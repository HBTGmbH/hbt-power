import {LocalDate} from '../../utils/DateUtil';

export class ViewQualification {
    name: string;
    date: LocalDate;
    enabled: boolean;


    constructor(name: string, date: LocalDate, enabled: boolean) {
        this.name = name;
        this.date = date;
        this.enabled = enabled;
    }

    public static of(viewQualification: ViewQualification) {
        return new ViewQualification(viewQualification.name, viewQualification.date, viewQualification.enabled);
    }
}