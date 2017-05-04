import {Education} from './Education';
import {APIEducationStep} from './APIProfile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';

/**
 * For notes about immutability, {@see TrainingEntry}
 */
export class EducationEntry {
    /**
     * DO NOT CHANGE THIS.NEVER.
     */
    public readonly id: string;
    public readonly startDate: Date;
    public readonly endDate: Date;
    public readonly educationId: string;
    public readonly isNew: boolean;

    private static CURRENT_LOCAL_ID: number = 0;

    private constructor(id: string, startDate: Date, endDate: Date, educationId: string, isNew: boolean) {
        this.id = id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.educationId = educationId;
        this.isNew = isNew;
    }


    /**
     * Non mutating function that changes the {@link EducationEntry.startDate} field and returns a copy.
     * @param date new start date
     * @returns {EducationEntry} copy
     */
    public changeStartDate(date: Date) : EducationEntry {
        return new EducationEntry(this.id, date, this.endDate, this.educationId, this.isNew);
    };


    /**
     * Non mutating function that changes the {@link EducationEntry.endDate} field and returns a copy.
     * @param date new end date
     * @returns {EducationEntry} copy
     */
    public changeEndDate(date: Date) : EducationEntry {
        return new EducationEntry(this.id, this.startDate, date, this.educationId, this.isNew);
    };

    /**
     * Non-mutating function that changes the {@link EducationEntry.educationId} by returning a copy with
     * the new id set.
     * @param newId
     * @returns {EducationEntry}
     */
    public changeEducationId(newId: string): EducationEntry {
        return new EducationEntry(this.id, this.startDate, this.endDate, newId, this.isNew);
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
            new Date(apiEducation.startDate),
            new Date(apiEducation.endDate),
            String(apiEducation.education.id),
            false);
    }

    /**
     * Creates an {@link EducationEntry} that can be considered 'new'. A new education entry will be
     * persistet during the next profile save operation against the API.
     * @returns {EducationEntry}
     */
    public static createNew() {
        return new EducationEntry(NEW_ENTITY_PREFIX + String(EducationEntry.CURRENT_LOCAL_ID++), new Date(), new Date(), UNDEFINED_ID, true);
    }


    public toAPIEducationEntry(educations: Immutable.Map<string, Education>): APIEducationStep {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            startDate: this.startDate.toISOString(),
            endDate: this.endDate.toISOString(),
            education: this.educationId == null ? null : educations.get(this.educationId).toAPI()
        }
    }
}