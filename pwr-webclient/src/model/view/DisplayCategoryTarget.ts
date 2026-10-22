/**
 * A category of the skill tree the skills of a display category can move to (#171), in the order of the tree
 */
export interface DisplayCategoryTarget {
    id: number;
    name: string;
    /** Levels below the highest category of the skills, 0 for the highest */
    depth: number;
    /** Skills of the display category that hang at or below this category */
    skills: number;
    /** All skills of the display category */
    of: number;
    /** The display category itself */
    current: boolean;
}
