import {APIEducationStep} from './APIProfile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';
import {doop} from 'doop';
import {isNullOrUndefined} from 'util';


@doop
export class EducationEntry {

    /**
     * Cant' use null here because it messes up material uis dropdown style.
     * @type {string}
     */
    public static NO_DEGREE_VALUE = " ";

    /**
     * DO NOT CHANGE THIS.NEVER.
     */
    @doop
    public get id(){
        return doop<string, this>();
    }
    @doop
    public get startDate() {
        return doop<Date, this>();
    }
    @doop
    public get endDate() {
        return doop<Date, this>();
    }
    @doop
    public get nameEntityId() {
        return doop<string, this>();
    }
    @doop
    public get degree() {
        return doop<string, this>();
    }
    @doop
    public get isNew() {
        return doop<boolean, this>();
    }

    private static CURRENT_LOCAL_ID: number = 0;

    private constructor(id: string, startDate: Date, endDate: Date, nameEntityId: string, degree: string, isNew: boolean) {
        return this.id(id).startDate(startDate).endDate(endDate).nameEntityId(nameEntityId).degree(degree).isNew(isNew);
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
            String(apiEducation.nameEntity.id),
            isNullOrUndefined(apiEducation.degree) ? EducationEntry.NO_DEGREE_VALUE : apiEducation.degree,
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


    public hasNoDegree() {
        return isNullOrUndefined(this.degree()) || this.degree() === EducationEntry.NO_DEGREE_VALUE;
    }

    public toAPIEducationEntry(educations: Immutable.Map<string, NameEntity>): APIEducationStep {
        console.log(this);
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            startDate: this.startDate().toISOString(),
            endDate: isNullOrUndefined(this.endDate()) ? null : this.endDate().toISOString(),
            nameEntity: this.nameEntityId() == null ? null : educations.get(this.nameEntityId()).toAPI(),
            degree: this.degree().trim().length > 0 ? this.degree() : null
        }
    }
}