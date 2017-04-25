import {APIEducation} from './APIProfile';
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
    readonly id: number;

    /**
     * Name of the education. This is provided by the server. Not that changing this will result in rejections by the
     * API, as consistency checks may fail.
     */
    readonly name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    public static create(apiEducation: APIEducation) {
        return new Education(apiEducation.id, apiEducation.name);
    }
}