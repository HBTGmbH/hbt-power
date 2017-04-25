import {CareerPosition} from './CareerPosition';
import {APICareerElement} from './APIProfile';
/**
 * Represents a career step. A career step must have a start date, but may have an non-exisiting end date. Each
 * career step has a positon assigned to it.
 */
export class CareerElement {
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
        return Object.assign({}, this, {startDate: newDate});
    }

    /**
     * Non-mutating function that changes the {@link CareerElement.endDate}
     * @param newDate the new date
     * @returns a new {@link CareerElement} with the modified {@link CareerElement.endDate}.
     */
    public changeEndDate(newDate: Date): CareerElement {
        return Object.assign({}, this, {endDate: newDate});
    }

    /**
     * Non-mutating function that changes the {@link CareerElement.careerPositionId}
     * @param newId
     * @returns a new instance of {@link CareerElement} with the modified {@link CareerElement.careerPositionId}
     */
    public changeCareerPositionId(newId: number) {
        return Object.assign({}, this, {careerPositionId: newId});
    }

    static toAPICareer(element: CareerElement, careerPositionsById: Array<CareerPosition>): APICareerElement {
        return {
            id: element.id,
            startDate: element.startDate.toDateString(),
            endDate: element.endDate.toDateString(),
            position: {
                id: element.careerPositionId,
                position: careerPositionsById[element.careerPositionId].position
            }
        }
    }
}