import {APIEducation} from './APIProfile';
import {NEW_ENTITY_PREFIX} from './PwrConstants';
/**
 * A single, immutable education. An education is a data object that defines a qualification that is acquired through a process of
 * government controlled learning. This contains:
 * - Schools
 * - Highschools
 * - Universites
 * - Training
 * Education always comes with a form of certificate that the education was successful (e.g. Bachelor's diploma).
 *
 */
export class Education {

    /**
     * ID provided by the server. This ID defines identity in terms of domain driven design. The ID should NEVER
     * be changed!
     */
    public readonly id: string;

    public readonly isNew: boolean;

    /**
     * Name of the education. This is provided by the server. Not that changing this will result in rejections by the
     * API, as consistency checks may fail.
     */
    public readonly name: string;

    private static CURRENT_LOCAL_ID: number = 0;

    private constructor(id: string, name: string, isNew: boolean) {
        this.id = id;
        this.name = name;
        this.isNew = isNew;
    }

    /**
     * Creates an {@link Education} that can be considered as 'new'.
     *
     * A 'new' entity will be persisted as new entity during an API Save operation of a whole profile. To achieve this,
     * the {@link Education} will be translated to an {@link APIEducation} with the id field set to <code>null</code>.
     * @param name
     */
    public createNew(name: string): Education {
        return new Education(NEW_ENTITY_PREFIX + String(Education.CURRENT_LOCAL_ID++), name, true);
    }

    public toAPI(): APIEducation {
        return {
            id: this.isNew? null : Number.parseInt(this.id),
            name: this.name
        }
    }

    public static fromAPI(apiEducation: APIEducation) {
        return new Education(
            String(apiEducation.id),
            apiEducation.name,
            false
        );
    }
}