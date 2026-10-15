
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
            !viewCareer.startDate ? null : new Date(viewCareer.startDate),
            !viewCareer.endDate ? null : new Date(viewCareer.endDate),
            viewCareer.enabled);
    }
}
