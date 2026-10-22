import {LocalDate} from '../../utils/DateUtil';

export class ViewEducation {
    name: string;
    startDate: LocalDate;
    endDate: LocalDate;
    degree: String;
    enabled: boolean;


    constructor(name: string, startDate: LocalDate, endDate: LocalDate, degree: String, enabled: boolean) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.degree = degree;
        this.enabled = enabled;
    }

    public static of(viewEducation: ViewEducation) {
        return new ViewEducation(viewEducation.name,
            viewEducation.startDate,
            viewEducation.endDate,
            viewEducation.degree, viewEducation.enabled);
    }
}
