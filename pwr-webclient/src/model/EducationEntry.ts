import {Education} from './Education';
import {APIEducationStep} from './APIProfile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';

/**
 * For notes about immutability, {@see CareerElement}
 */
export class EducationEntry {
    /**
     * DO NOT CHANGE THIS.NEVER.
     */
    public readonly id: string;
    public readonly date: Date;
    public readonly educationId: string;
    public readonly isNew: boolean;

    private static CURRENT_LOCAL_ID: number = 0;

    private constructor(id: string, date: Date, educationId: string, isNew: boolean) {
        this.id = id;
        this.date = date;
        this.educationId = educationId;
        this.isNew = isNew;
    }

    public changeDate(newDate: Date): EducationEntry {
        return new EducationEntry(this.id, newDate, this.educationId, this.isNew);
    }

    /**
     * Non-mutating function that changes the {@link EducationEntry.educationId} by returning a copy with
     * the new id set.
     * @param newId
     * @returns {EducationEntry}
     */
    public changeEducationId(newId: string): EducationEntry {
        return new EducationEntry(this.id, this.date, newId, this.isNew);
    }


    /**
     * Creates a new {@link EducationEntry} from the {@link APIEducationStep}. The date represented as string
     * is parsed as to a {@link Date} object.
     * @param apiEducation
     * @returns {EducationEntry}
     */
    public static fromAPI(apiEducation: APIEducationStep): EducationEntry {
        return new EducationEntry(
            String(apiEducation.id),
            new Date(apiEducation.date),
            String(apiEducation.education.id),
            false);
    }

    /**
     * Creates an {@link EducationEntry} that can be considered 'new'. A new education entry will be
     * persistet during the next profile save operation against the API.
     * @returns {EducationEntry}
     */
    public static createNew() {
        return new EducationEntry(NEW_ENTITY_PREFIX + String(EducationEntry.CURRENT_LOCAL_ID++), new Date(), UNDEFINED_ID, true);
    }


    public toAPIEducationEntry(educations: Immutable.Map<string, Education>): APIEducationStep {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            date: this.date.toDateString(),
            education: this.educationId == null ? null : educations.get(this.educationId).toAPI()
        }
    }
}