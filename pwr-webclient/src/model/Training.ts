import {APITraining} from './APIProfile';
/**
 * A single, immutable career name. These positions are served by an API endpoint and are not to modified.
 */
export class Training {
    public readonly id: string;
    public readonly name: string;

    /**
     * Defines if the Training is new and needs persisting during the next API save operation, or if it
     * represents an already existent Entity. A new entity's id will be set to 'null' in the export entity.
     * @type {boolean}
     */
    public readonly isNew: boolean = false;

    private static readonly NEW_PREFIX: string = "NEW";
    private static CURR_ID: number = 0;

    private constructor(id: string, position: string, isNew: boolean) {
        this.id = id;
        this.name = position;
        this.isNew = isNew;
    }

    /**
     * Creates a {@Training} that is considered 'new'.
     *
     * When saving a profile with a new name, the API will fromAPI a persistent entity from it.
     * @param position
     */
    public createNew(position: string) {
        return new Training(Training.NEW_PREFIX + Training.CURR_ID++, position, true);
    }

    /**
     * Translates this Training into an API conform entity.
     * If the entity is 'new', it's id will be set to null.
     * @returns {{id: string, name: string}}
     */
    public toAPI(): APITraining {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            name: this.name
        }
    }
    /**
     * Creates a new {@link Training} from the given API result.
     * @param apiCareerPosition
     * @returns {Training}
     */
    public static fromAPI(apiCareerPosition: APITraining) {
        return new Training(
            String(apiCareerPosition.id),
            apiCareerPosition.name,
            false);
    }
}