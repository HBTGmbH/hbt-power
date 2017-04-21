/**
 * Some sort of education. This may include: School, academic courses and degrees, interships, trainings,..
 *
 * This element itself may be shared amoing many education entries. Because of this, an education must not be mutated.
 * If the need for a changed name arises, a NEW education is required.
 */
export interface Education {

    /**
     * ID provided by the server
     */
    id: number;

    /**
     * Name
     */
    name: string;
}