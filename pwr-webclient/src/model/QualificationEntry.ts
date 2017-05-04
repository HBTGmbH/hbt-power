import {Qualification} from './Qualification';
import {APIQualificationEntry} from './APIProfile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';

export class QualificationEntry {
    public readonly id: string;
    public readonly qualificationId: string;
    public readonly date: Date;
    public readonly isNew: boolean;

    private static CURRENT_LOCAL_ID: number = 0;

    private constructor(id: string, qualificationId: string, date: Date, isNew: boolean) {
        this.id = id;
        this.qualificationId = qualificationId;
        this.date = date;
        this.isNew = isNew;
    }

    public changeDate(newDate: Date): QualificationEntry {
        return new QualificationEntry(this.id, this.qualificationId, newDate, this.isNew);
    }

    public changeQualificationId(newQualificationId: string): QualificationEntry {
        return new QualificationEntry(this.id, newQualificationId, this.date, this.isNew);
    }

    public static fromAPI(apiQualificationEntry: APIQualificationEntry): QualificationEntry {
        return new QualificationEntry(
            String(apiQualificationEntry.id),
            String(apiQualificationEntry.qualification.id),
            new Date(apiQualificationEntry.date),
            false
        );
    }

    /**
     * FIXME !Important doc
     * @returns {QualificationEntry}
     */
    public static createNew(): QualificationEntry {
        return new QualificationEntry(NEW_ENTITY_PREFIX + String(QualificationEntry.CURRENT_LOCAL_ID++), UNDEFINED_ID, new Date(), true);
    }

    /**
     * Transl
     * @param qualifications
     * @returns {{id: number, date: string, qualification: (APIEducation|APILanguage|APIQualification|APICareerPosition)}}
     */
    public toAPIQualificationEntry(qualifications: Immutable.Map<string, Qualification>): APIQualificationEntry {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            date: this.date.toDateString(),
            qualification: this.qualificationId == UNDEFINED_ID ? null : qualifications.get(this.qualificationId).toAPI()
        }
    }
}