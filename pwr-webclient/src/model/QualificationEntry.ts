import {Qualification} from './Qualification';
import {APIQualificationEntry} from './APIProfile';
import * as Immutable from 'immutable';

export class QualificationEntry {
    public readonly id: number;
    public readonly qualificationId: number;
    public readonly date: Date;

    public constructor(id: number, qualificationId: number, date: Date) {
        this.id = id;
        this.qualificationId = qualificationId;
        this.date = date;
    }

    public changeDate(newDate: Date): QualificationEntry {
        return new QualificationEntry(this.id, this.qualificationId, newDate);
    }

    public changeQualificationId(newQualificationId: number): QualificationEntry {
        return new QualificationEntry(this.id, newQualificationId, this.date);
    }

    public static create(apiQualificationEntry: APIQualificationEntry): QualificationEntry {
        return new QualificationEntry(
            apiQualificationEntry.id,
            apiQualificationEntry.qualification.id,
            new Date(apiQualificationEntry.date)
        );
    }

    public toAPIQualificationEntry(qualifications: Immutable.Map<number, Qualification>): APIQualificationEntry {
        return {
            id: this.id,
            date: this.date.toDateString(),
            qualification: {
                id: this.qualificationId,
                name: qualifications.get(this.qualificationId).name
            }
        }
    }
}