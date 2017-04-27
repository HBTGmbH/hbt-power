import {APICareerPosition} from './APIProfile';
/**
 * A single, immutable career position. These positions are served by an API endpoint and are not to modified.
 */
export class CareerPosition {
    readonly id: number;
    readonly position: string;

    constructor(id: number, position: string) {
        this.id = id;
        this.position = position;
    }

    public toAPI(): APICareerPosition {
        return {
            id: this.id,
            position: this.position
        }
    }
    /**
     * Creates a new {@link CareerPosition} from the given API result.
     * @param apiCareerPosition
     * @returns {CareerPosition}
     */
    public static create(apiCareerPosition: APICareerPosition) {
        return new CareerPosition(apiCareerPosition.id, apiCareerPosition.position);
    }
}