import {CareerPosition} from './CareerPosition';
import {APICareerElement} from './APIProfile';
import * as Immutable from 'immutable';
import {start} from 'repl';
import {isNullOrUndefined} from 'util';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
/**
 * Immutable representation of a career element. A career element represents a persons single career steps during their
 * professional career.
 * <p>
 *     To follow redux and domain driven design, the object has to be kept immutable. All mutators have to return a copy
 *     of the existing {@link CareerElement} with the changed value.
 *  </p>
 *  <p>
 *      As the client implements an anti corruption layer against the API, methods need to be provided to serialize and
 *      deserialize from the API output. These methods may require change if the APIs output changes.
 *  </p>
 *  <p>
 *      Note that the {@link CareerElement.id} element should never change. This is used to uniquely identify the
 *      element among all elements and all APIs. The ID, in that case, describes <em>identitiy</em> respective to
 *      domain driven design.
 */
export class CareerElement {
    /**
     * NEVER CHANGE THIS! NOT EVEN NON-MUTATING!
     */
    public readonly id: string;
    public readonly startDate: Date;
    public readonly endDate: Date;
    public readonly careerPositionId: string;
    public readonly isNew: boolean;


    // Current ID for new entites.
    private static CURRENT_ID: number = 0;

    private constructor(id: string, startDate: Date, endDate: Date, careerPositionId: string, isNew: boolean) {
        this.id = id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.careerPositionId = careerPositionId;
        this.isNew = isNew;
    }

    /**
     * Creates an {@link CareerElement} from an {@link APICareerElement}.
     * @param apiCareerElement
     * @returns {CareerElement}
     */
    public static fromAPI(apiCareerElement: APICareerElement): CareerElement {
        console.log(apiCareerElement);
        return new CareerElement(
            String(apiCareerElement.id),
            new Date(apiCareerElement.startDate),
            isNullOrUndefined(apiCareerElement.endDate) ? null : new Date(apiCareerElement.endDate),
            String(apiCareerElement.position.id),
            false
        );
    }

    /**
     * Creates a CareerElement that can be considered as 'new'.
     *
     * When translated to an API entity, the ID will be replaced with null, which triggers a persistence operation.
     * @returns {CareerElement}
     */
    public static createNew() {
        return new CareerElement(
            NEW_ENTITY_PREFIX + String(CareerElement.CURRENT_ID++),
            new Date(),
            new Date(),
            UNDEFINED_ID,
            true
        );
    }

    /**
     * Non-mutating function that changes the start date of this Career Element
     * @param newDate the new date
     * @returns a new {@link CareerElement} with the modified date.
     */
    public changeStartDate(newDate: Date): CareerElement {
        return new CareerElement(this.id, newDate, this.endDate, this.careerPositionId, this.isNew);
    }

    /**
     * Non-mutating function that changes the {@link CareerElement.endDate}
     * @param newDate the new date
     * @returns a new {@link CareerElement} with the modified {@link CareerElement.endDate}.
     */
    public changeEndDate(newDate: Date): CareerElement {
        return new CareerElement(this.id, this.startDate, newDate, this.careerPositionId, this.isNew);
    }

    /**
     * Non-mutating function that changes the {@link CareerElement.careerPositionId}
     * @param newId
     * @returns a new instance of {@link CareerElement} with the modified {@link CareerElement.careerPositionId}
     */
    public changeCareerPositionId(newId: string) {
        return new CareerElement(this.id, this.startDate, this.endDate, newId, this.isNew);
    }

    /**
     * Converts this {@CareerElement} into it's API specific representation.
     * @param careerPositionsById
     * @returns the {@link APICareerElement} that represents this {@link CareerElement}
     */
    public toAPICareer(careerPositionsById: Immutable.Map<String, CareerPosition>): APICareerElement {
        return {
            id: this.isNew? null : Number.parseInt(this.id),
            startDate: this.startDate.toDateString(),
            endDate: this.endDate==null ? null : this.endDate.toDateString(),
            position: this.careerPositionId == null ? null : careerPositionsById.get(this.careerPositionId).toAPI()
        }
    }
}