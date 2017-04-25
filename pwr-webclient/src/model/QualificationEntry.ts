import {Qualification} from './Qualification';
import {APIQualificationEntry} from './APIProfile';
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

    public static create(apiQualificationEntry: APIQualificationEntry): QualificationEntry {
        return new QualificationEntry(
            apiQualificationEntry.id,
            apiQualificationEntry.qualification.id,
            new Date(apiQualificationEntry.date)
        );
    }

    public static toAPIQualificationEntry(entry: QualificationEntry, qualificationsById: Array<Qualification>): APIQualificationEntry {
        return {
            id: entry.id,
            date: entry.date.toDateString(),
            qualification: {
                id: entry.qualificationId,
                name: qualificationsById[entry.qualificationId].name
            }
        }
    }
}