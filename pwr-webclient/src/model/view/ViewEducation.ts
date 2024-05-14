export class ViewEducation {
    name: string;
    startDate: Date;
    endDate: Date;
    degree: String;
    enabled: boolean;


    constructor(name: string, startDate: Date, endDate: Date, degree: String, enabled: boolean) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.degree = degree;
        this.enabled = enabled;
    }

    public static of(viewEducation: ViewEducation) {
        return new ViewEducation(viewEducation.name,
            !viewEducation.startDate ? null : new Date(viewEducation.startDate),
            !viewEducation.endDate ? null : new Date(viewEducation.endDate),
            viewEducation.degree, viewEducation.enabled);
    }
}
