import {APIQualification} from './APIProfile';
export class Qualification {
    public readonly id: string;
    public readonly name: string;
    public readonly isNew: boolean;

    private static CURRENT_ID: number = 0;

    private constructor(id: string, name: string, isNew: boolean) {
        this.name = name;
        this.id = id;
        this.isNew = isNew;
    }

    public static fromAPI(apiQualification: APIQualification) {
        return new Qualification(
            String(apiQualification.id),
            apiQualification.name,
            false);
    }

    public toAPI(): APIQualification {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            name: this.name
        }
    }
}
