import {Training} from './Training';
import {APITrainingEntry} from './APIProfile';
import * as Immutable from 'immutable';
import {isNullOrUndefined} from 'util';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
/**
 * Immutable representation of a career element. A career element represents a persons single career steps during their
 * professional career.
 * <p>
 *     To follow redux and domain driven design, the object has to be kept immutable. All mutators have to return a copy
 *     of the existing {@link TrainingEntry} with the changed value.
 *  </p>
 *  <p>
 *      As the client implements an anti corruption layer against the API, methods need to be provided to serialize and
 *      deserialize from the API output. These methods may require change if the APIs output changes.
 *  </p>
 *  <p>
 *      Note that the {@link TrainingEntry.id} element should never change. This is used to uniquely identify the
 *      element among all elements and all APIs. The ID, in that case, describes <em>identitiy</em> respective to
 *      domain driven design.
 */
export class TrainingEntry {
    /**
     * NEVER CHANGE THIS! NOT EVEN NON-MUTATING!
     */
    public readonly id: string;
    public readonly startDate: Date;
    public readonly endDate: Date;
    public readonly trainingId: string;
    public readonly isNew: boolean;


    // Current ID for new entities.
    private static CURRENT_ID: number = 0;

    private constructor(id: string, startDate: Date, endDate: Date, trainignId: string, isNew: boolean) {
        this.id = id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.trainingId = trainignId;
        this.isNew = isNew;
    }

    /**
     * Creates an {@link TrainingEntry} from an {@link APITrainingEntry}.
     * @param apiTraining
     * @returns {TrainingEntry}
     */
    public static fromAPI(apiTraining: APITrainingEntry): TrainingEntry {
        return new TrainingEntry(
            String(apiTraining.id),
            new Date(apiTraining.startDate),
            isNullOrUndefined(apiTraining.endDate) ? null : new Date(apiTraining.endDate),
            String(apiTraining.training.id),
            false
        );
    }

    /**
     * Creates a TrainingEntry that can be considered as 'new'.
     *
     * When translated to an API entity, the ID will be replaced with null, which triggers a persistence operation.
     * @returns {TrainingEntry}
     */
    public static createNew() {
        return new TrainingEntry(
            NEW_ENTITY_PREFIX + String(TrainingEntry.CURRENT_ID++),
            new Date(),
            new Date(),
            UNDEFINED_ID,
            true
        );
    }

    /**
     * Non-mutating function that changes the start date of this TrainingEntries Element
     * @param newDate the new date
     * @returns a new {@link TrainingEntry} with the modified date.
     */
    public changeStartDate(newDate: Date): TrainingEntry {
        return new TrainingEntry(this.id, newDate, this.endDate, this.trainingId, this.isNew);
    }

    /**
     * Non-mutating function that changes the {@link TrainingEntry.endDate}
     * @param newDate the new date
     * @returns a new {@link TrainingEntry} with the modified {@link TrainingEntry.endDate}.
     */
    public changeEndDate(newDate: Date): TrainingEntry {
        return new TrainingEntry(this.id, this.startDate, newDate, this.trainingId, this.isNew);
    }

    /**
     * Non-mutating function that changes the {@link TrainingEntry.trainingId}
     * @param newId
     * @returns a new instance of {@link TrainingEntry} with the modified {@link TrainingEntry.trainingId}
     */
    public changeCareerPositionId(newId: string) {
        return new TrainingEntry(this.id, this.startDate, this.endDate, newId, this.isNew);
    }

    /**
     * Converts this {@TrainingEntry} into it's API specific representation.
     * @param careerPositionsById
     * @returns the {@link APICareerElement} that represents this {@link TrainingEntry}
     */
    public toAPICareer(careerPositionsById: Immutable.Map<String, Training>): APITrainingEntry {
        return {
            id: this.isNew? null : Number.parseInt(this.id),
            startDate: this.startDate.toISOString(),
            endDate: this.endDate==null ? null : this.endDate.toISOString(),
            training: this.trainingId == null ? null : careerPositionsById.get(this.trainingId).toAPI()
        }
    }
}