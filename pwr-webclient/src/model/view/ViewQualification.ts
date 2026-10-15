export class ViewQualification {
    name: string;
    date: Date;
    enabled: boolean;


    constructor(name: string, date: Date, enabled: boolean) {
        this.name = name;
        this.date = date;
        this.enabled = enabled;
    }

    public static of(viewQualification: ViewQualification) {
        return new ViewQualification(viewQualification.name, new Date(viewQualification.date), viewQualification.enabled);
    }
}