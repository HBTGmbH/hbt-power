import {LocalDate} from '../../utils/DateUtil';

export class ViewTraining {
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

    public static of(viewTraining: ViewTraining) {
        return new ViewTraining(viewTraining.name,
            viewTraining.startDate,
            viewTraining.endDate,
            viewTraining.enabled);
    }
}
