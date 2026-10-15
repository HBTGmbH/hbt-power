
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
            !viewTraining.startDate ? null : new Date(viewTraining.startDate),
            !viewTraining.endDate ? null : new Date(viewTraining.endDate),
            viewTraining.enabled);
    }
}
