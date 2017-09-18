import {isNullOrUndefined} from 'util';
export class ViewTraining {
    name: string;
    startDate: Date;
    endDate: Date;
    enabled: boolean;


    constructor(name: string, startDate: Date, endDate: Date, enabled: boolean) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.enabled = enabled;
    }

    public static of(viewTraining: ViewTraining) {
        return new ViewTraining(viewTraining.name,
            isNullOrUndefined(viewTraining.startDate) ? null : new Date(viewTraining.startDate),
            isNullOrUndefined(viewTraining.endDate) ? null : new Date(viewTraining.endDate),
            viewTraining.enabled);
    }
}