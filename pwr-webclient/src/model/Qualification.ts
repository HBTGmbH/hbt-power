import {APIQualification} from './APIProfile';
export class Qualification {
    readonly id: number;
    readonly name: string;

    public constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    public static create(apiQualification: APIQualification) {
        return new Qualification(apiQualification.id, apiQualification.name);
    }
}
