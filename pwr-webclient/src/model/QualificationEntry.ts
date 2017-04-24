import {Qualification} from './Qualification';
import {APIQualification} from './APIProfile';
export class QualificationEntry {
    id: number;
    qualificationId: number;
    date: Date;

    public static toAPIQualificationEntry(entry: QualificationEntry, qualificationsById: Array<Qualification>): APIQualification {
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