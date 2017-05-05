import {APIEducationStep} from './APIProfile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';

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
    public readonly nameEntityId: string;
    public readonly degree: string;
    public readonly isNew: boolean;

    private static CURRENT_LOCAL_ID: number = 0;

    private constructor(id: string, startDate: Date, endDate: Date, nameEntityId: string, degree: string, isNew: boolean) {
        this.id = id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.degree = degree;
        this.nameEntityId = nameEntityId;
        this.isNew = isNew;
    }

    public changeDegree(newDegree: string): EducationEntry {
        return new EducationEntry(this.id, this.startDate, this.endDate, this.nameEntityId, newDegree, this.isNew);
    }

    /**
     * Non mutating function that changes the {@link EducationEntry.startDate} field and returns a copy.
     * @param date new start date
     * @returns {EducationEntry} copy
     */
    public changeStartDate(date: Date) : EducationEntry {
        return new EducationEntry(this.id, date, this.endDate, this.nameEntityId, this.degree, this.isNew);
    };


    /**
     * Non mutating function that changes the {@link EducationEntry.endDate} field and returns a copy.
     * @param date new end date
     * @returns {EducationEntry} copy
     */
    public changeEndDate(date: Date) : EducationEntry {
        return new EducationEntry(this.id, this.startDate, date, this.nameEntityId,this.degree, this.isNew);
    };

    /**
     * Non-mutating function that changes the {@link EducationEntry.nameEntityId} by returning a copy with
     * the new id set.
     * @param newId
     * @returns {EducationEntry}
     */
    public changeEducationId(newId: string): EducationEntry {
        return new EducationEntry(this.id, this.startDate, this.endDate, newId, this.degree, this.isNew);
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
            String(apiEducation.degree),
            false);
    }

    /**
     * Creates an {@link EducationEntry} that can be considered 'new'. A new education entry will be
     * persistet during the next profile save operation against the API.
     * @returns {EducationEntry}
     */
    public static createNew() {
        return new EducationEntry(NEW_ENTITY_PREFIX + String(EducationEntry.CURRENT_LOCAL_ID++), new Date(), new Date(), UNDEFINED_ID, "", true);
    }


    public toAPIEducationEntry(educations: Immutable.Map<string, NameEntity>): APIEducationStep {
        console.log(this);
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            startDate: this.startDate.toISOString(),
            endDate: this.endDate.toISOString(),
            education: this.nameEntityId == null ? null : educations.get(this.nameEntityId).toAPI(),
            degree: this.degree
        }
    }
}