import {isNullOrUndefined} from 'util';
export class ViewCareer {
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

    public static of(viewCareer: ViewCareer) {
        return new ViewCareer(viewCareer.name,
            isNullOrUndefined(viewCareer.startDate) ? null : new Date(viewCareer.startDate),
            isNullOrUndefined(viewCareer.endDate) ? null : new Date(viewCareer.endDate),
            viewCareer.enabled);
    }
}
