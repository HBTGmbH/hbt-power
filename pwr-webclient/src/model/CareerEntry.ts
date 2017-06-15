
import {doop} from 'doop';
import {APICareerEntry, APIEducationStep} from './APIProfile';
import {EducationEntry} from './EducationEntry';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';
import {isNullOrUndefined} from 'util';
@doop
export class CareerEntry {
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

    private constructor(id: string, startDate: Date, endDate: Date, nameEntityId: string, isNew: boolean) {
        return this.id(id).startDate(startDate).endDate(endDate).nameEntityId(nameEntityId).isNew(isNew);
    }


    /**
     * Creates a new {@link EducationEntry} from the {@link APIEducationStep}. The date represented as string
     * is parsed as to a {@link Date} object.
     * @param apiCareer
     * @returns {EducationEntry}
     */
    public static fromAPI(apiCareer: APICareerEntry): CareerEntry {
        return new CareerEntry(
            String(apiCareer.id),
            new Date(apiCareer.startDate),
            isNullOrUndefined(apiCareer.endDate) ? null : new Date(apiCareer.endDate),
            String(apiCareer.nameEntity.id),
            false);
    }

    /**
     * Creates an {@link EducationEntry} that can be considered 'new'. A new education entry will be
     * persistet during the next profile save operation against the API.
     * @returns {EducationEntry}
     */
    public static createNew() {
        return new CareerEntry(NEW_ENTITY_PREFIX + String(CareerEntry.CURRENT_LOCAL_ID++), new Date(), new Date(), UNDEFINED_ID, true);
    }


    public toAPI(careers: Immutable.Map<string, NameEntity>): APICareerEntry {
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            startDate: this.startDate().toISOString(),
            endDate: isNullOrUndefined(this.endDate()) ? null : this.endDate().toISOString(),
            nameEntity: this.nameEntityId() == null ? null : careers.get(this.nameEntityId()).toAPI()
        }
    }
}