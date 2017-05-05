import {NEW_ENTITY_PREFIX} from './PwrConstants';
import {APINameEntity} from './APIProfile';
export class NameEntity {
    public readonly id: string;
    public readonly name: string;
    public readonly isNew: boolean;

    private static CURRENT_LOCAL_ID: number = 0;

    protected constructor(id: string, name:string, isNew: boolean) {
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
    public static createNew(name: string): NameEntity {
        return new NameEntity(NEW_ENTITY_PREFIX + String(NameEntity.CURRENT_LOCAL_ID++), name, true);
    }

    public toAPI(): APINameEntity {
        return {
            id: this.isNew? null : Number.parseInt(this.id),
            name: this.name
        }
    }

    public static fromAPI(nameEntity: APINameEntity) {
        return new NameEntity(
            String(nameEntity.id),
            nameEntity.name,
            false
        );
    }
}