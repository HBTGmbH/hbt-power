import {CareerPosition} from './CareerPosition';
/**
 * Represents a career step. A career step must have a start date, but may have an non-exisiting end date. Each
 * career step has a positon assigned to it.
 */
export interface CareerElement {
    id: number;
    startDate: Date;
    endDate: Date;
    position: CareerPosition;
}