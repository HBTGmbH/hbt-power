import {CareerPosition} from './CareerPosition';
import {APICareer} from './APIProfile';
/**
 * Represents a career step. A career step must have a start date, but may have an non-exisiting end date. Each
 * career step has a positon assigned to it.
 */
export class CareerElement {
    id: number;
    startDate: Date;
    endDate: Date;
    careerPositionId: number;

    static toAPICareer(element: CareerElement, careerPositionsById: Array<CareerPosition>): APICareer {
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