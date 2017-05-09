import {APIQualificationEntry} from './APIProfile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';
import {doop} from 'doop';

@doop
export class QualificationEntry {
    @doop
    public get id() {return doop<string, this>();}
    @doop
    public get qualificationId() {return doop<string, this>();}
    @doop
    public get date() {return doop<Date, this>();}
    @doop
    public get isNew() {return doop<boolean, this>();}

    private static CURRENT_LOCAL_ID: number = 0;

    private constructor(id: string, qualificationId: string, date: Date, isNew: boolean) {
        return this.id(id).qualificationId(qualificationId).date(date).isNew(isNew);
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
     *
     * @param qualifications
     * @returns {{id: number, date: string, qualification: APINameEntity}}
     */
    public toAPIQualificationEntry(qualifications: Immutable.Map<string, NameEntity>): APIQualificationEntry {
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            date: this.date().toISOString(),
            qualification: this.qualificationId() == UNDEFINED_ID ? null : qualifications.get(this.qualificationId()).toAPI()
        }
    }
}