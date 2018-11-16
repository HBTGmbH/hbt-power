import {APITrainingEntry} from './APIProfile';
import * as Immutable from 'immutable';
import {isNullOrUndefined} from 'util';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';
import {doop} from 'doop';
import {DateUtils} from '../utils/DateUtil';

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
@doop
export class TrainingEntry {
    /**
     * NEVER CHANGE THIS! NOT EVEN NON-MUTATING!
     */
    @doop
    public get id() {
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
    public get trainingId() {
        return doop<string, this>();
    }

    @doop
    public get isNew() {
        return doop<boolean, this>();
    }


    // Current ID for new entities.
    private static CURRENT_ID: number = 0;

    private constructor(id: string, startDate: Date, endDate: Date, trainignId: string, isNew: boolean) {
        return this.id(id).startDate(startDate).endDate(endDate).trainingId(trainignId).isNew(isNew);
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
            String(apiTraining.nameEntity.id),
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
     * Converts this {@TrainingEntry} into it's API specific representation.
     * @param careerPositionsById
     * @returns the {@link APICareerElement} that represents this {@link TrainingEntry}
     */
    public toAPICareer(careerPositionsById: Immutable.Map<String, NameEntity>): APITrainingEntry {
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            startDate: DateUtils.formatLocaleDateToIso(this.startDate()),
            endDate: DateUtils.formatLocaleDateToIso(this.endDate()),
            nameEntity: this.trainingId() == null ? null : careerPositionsById.get(this.trainingId()).toAPI()
        };
    }
}