/**
 * Another name of a profile element (#270): a former name from renaming or merging, or one an admin added. Typing it
 * gives the element <code>currentName</code>.
 */
export interface NameEntityAlias {
    /** NameEntityType of the element */
    type: string;
    name: string;
    currentName: string;
}
