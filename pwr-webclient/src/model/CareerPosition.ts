import {APICareerPosition} from './APIProfile';
/**
 * A single, immutable career position. These positions are served by an API endpoint and are not to modified.
 */
export class CareerPosition {
    public readonly id: string;
    public readonly position: string;

    /**
     * Defines if the CareerPosition is new and needs persisting during the next API save operation, or if it
     * represents an already existent Entity. A new entity's id will be set to 'null' in the export entity.
     * @type {boolean}
     */
    public readonly isNew: boolean = false;

    private static readonly NEW_PREFIX: string = "NEW";
    private static CURR_ID: number = 0;

    private constructor(id: string, position: string, isNew: boolean) {
        this.id = id;
        this.position = position;
        this.isNew = isNew;
    }

    /**
     * Creates a {@CareerPosition} that is considered 'new'.
     *
     * When saving a profile with a new position, the API will fromAPI a persistent entity from it.
     * @param position
     */
    public createNew(position: string) {
        return new CareerPosition(CareerPosition.NEW_PREFIX + CareerPosition.CURR_ID++, position, true);
    }

    /**
     * Translates this CareerPosition into an API conform entity.
     * If the entity is 'new', it's id will be set to null.
     * @returns {{id: string, position: string}}
     */
    public toAPI(): APICareerPosition {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            position: this.position
        }
    }
    /**
     * Creates a new {@link CareerPosition} from the given API result.
     * @param apiCareerPosition
     * @returns {CareerPosition}
     */
    public static fromAPI(apiCareerPosition: APICareerPosition) {
        return new CareerPosition(
            String(apiCareerPosition.id),
            apiCareerPosition.position,
            false);
    }
}