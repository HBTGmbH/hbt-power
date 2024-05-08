import {NEW_ENTITY_PREFIX} from './PwrConstants';
import {APINameEntity} from './APIProfile';

/**
 * Describes an unique name/qualifier.
 *
 * NameEntities are used for almost all profile elements (like {@link LanguageSkill}, {@link SectorEntry}) to encapsulate
 * their ("Spanisch" as an example for a language, "Automotive" as an example for a sector) names into an entity. Interpreting
 * these names as separate entities is part of a major design decision that attempts to create consistency among all
 * profiles.
 *
 * Consider the following example:
 * - A consultant called "Bob" has the sector "Cars" in his profile
 * - A consultant called "Alice" has the same sector, "Cars" in his profile
 * - An admin decides that the term "Cars" does not suite the standard of consistency while looking through
 *   Bob's profile, and renames it to "Automotive". As a result, because "Cars" was an entity, every reference
 *   to this entity is now has the name "Automotive". This allows consistency through all profiles.
 *
 * As a result, new {@link NameEntity} objects should never be created lightly. The user should be given a range of
 * {@link NameEntity} to choose from, and, as the {@link NameEntity.name} can be considered as identification, no two
 * {@link NameEntity} objects with the same name should exists.
 */
export class NameEntity {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _isNew: boolean;
    private readonly _type: string;

    /**
     * ID of this {@NameEntity}. Represents identity throughout the whole API enviroment. A null ID sent
     * to the API represents a new {@link NameEntity}
     */
    public id() {
        return this._id;
    }

    /**
     * Name of this {@link NameEntity}. Can be considered as unique among all {@link NameEntity} objects
     * <em>for one Profile Entry type only!</em>
     *
     * There might be two {@link NameEntity} objects with the same name, but one is associated with a {@link SectorEntry}
     * while the other is associated with {@link QualificationEntry}, but they are coincidentally sharing the same name.
     *
     * This is because the API has separate entities for each {@link ProfileElementType}, while these entities share
     * the same class in this client. This has practical reasons: The signatures are identical on each {@link NameEntity},
     * which reduces cluttering of classes.
     */
    public name() {
        return this._name;
    }

    public setName(name: string): NameEntity {
        return new NameEntity(this._id, name, this._isNew, this._type);
    }

    /**
     * Defines if this {@link NameEntity} is new: Created by this client, not by the server, and not yet sent to the API
     * in an update operation.
     *
     * New {@link NameEntity} objects need their ID set to null before persisiting them against the API.
     */
    public isNew() {
        return this._isNew;
    }

    public type() {
        return this._type;
    }

    /**
     * Used whenever a local ID is created. These IDs are not persistent and should be prefixed with {@link NEW_ENTITY_PREFIX}
     * to create a seperate namespace for local IDs.
     * @type {number}
     */
    private static CURRENT_LOCAL_ID: number = 0;

    protected constructor(id: string, name: string, isNew: boolean, type: string) {
        this._id = id;
        this._name = name;
        this._isNew = isNew;
        this._type = type;
    }


    /**
     * Creates an {@link APINameEntity} and returns it.
     *
     * The resulting {@link APINameEntity.id} will be set to null if {@link NameEntity.isNew} is true.
     * @returns {{id: number, name: string}}
     */
    public toAPI(): APINameEntity {
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            name: this.name(),
            type: this.type()
        };
    }

    /**
     * Parses API input and creates a new {@link NameEntity} from it.
     * @param nameEntity
     * @returns {NameEntity}
     */
    public static fromAPI(nameEntity: APINameEntity) {
        return new NameEntity(
            String(nameEntity.id),
            nameEntity.name,
            false,
            nameEntity.type
        );
    }
}
