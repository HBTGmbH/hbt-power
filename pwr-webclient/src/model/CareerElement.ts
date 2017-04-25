import {CareerPosition} from './CareerPosition';
import {APICareerElement} from './APIProfile';
import * as Immutable from 'immutable';
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
    readonly id: number;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly careerPositionId: number;



    private constructor(id: number, startDate: Date, endDate: Date, careerPositionId: number) {
        this.id = id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.careerPositionId = careerPositionId;
    }

    /**
     * Creates an {@link CareerElement} from an {@link APICareerElement}.
     * @param apiCareerElement
     * @returns {CareerElement}
     */
    public static create(apiCareerElement: APICareerElement): CareerElement {
        return new CareerElement(
            apiCareerElement.id,
            new Date(apiCareerElement.startDate),
            new Date(apiCareerElement.endDate),
            apiCareerElement.position.id
        );
    }

    /**
     * Non-mutating function that changes the start date of this Career Element
     * @param newDate the new date
     * @returns a new {@link CareerElement} with the modified date.
     */
    public changeStartDate(newDate: Date): CareerElement {
        return new CareerElement(this.id, newDate, this.endDate, this.careerPositionId);
    }

    /**
     * Non-mutating function that changes the {@link CareerElement.endDate}
     * @param newDate the new date
     * @returns a new {@link CareerElement} with the modified {@link CareerElement.endDate}.
     */
    public changeEndDate(newDate: Date): CareerElement {
        return new CareerElement(this.id, this.startDate, newDate, this.careerPositionId);
    }

    /**
     * Non-mutating function that changes the {@link CareerElement.careerPositionId}
     * @param newId
     * @returns a new instance of {@link CareerElement} with the modified {@link CareerElement.careerPositionId}
     */
    public changeCareerPositionId(newId: number) {
        return Object.assign({}, this, {careerPositionId: newId});
    }

    static toAPICareer(element: CareerElement, careerPositionsById: Immutable.Map<number, CareerPosition>): APICareerElement {
        return {
            id: element.id,
            startDate: element.startDate.toDateString(),
            endDate: element.endDate.toDateString(),
            position: {
                id: element.careerPositionId,
                position: careerPositionsById.get(element.careerPositionId).position
            }
        }
    }
}