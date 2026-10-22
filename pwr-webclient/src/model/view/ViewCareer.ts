import {LocalDate} from '../../utils/DateUtil';

export class ViewCareer {
    name: string;
    startDate: LocalDate;
    endDate: LocalDate;
    enabled: boolean;


    constructor(name: string, startDate: LocalDate, endDate: LocalDate, enabled: boolean) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.enabled = enabled;
    }

    public static of(viewCareer: ViewCareer) {
        return new ViewCareer(viewCareer.name,
            viewCareer.startDate,
            viewCareer.endDate,
            viewCareer.enabled);
    }
}
