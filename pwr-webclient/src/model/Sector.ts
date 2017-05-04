import {APISector, APISectorEntry} from './APIProfile';
import {NEW_ENTITY_PREFIX} from './PwrConstants';
export class Sector {
    public readonly id: string;
    public readonly name: string;
    public readonly isNew: boolean;

    private static CURRENT_ID: number = 0;

    private constructor(id: string, name: string, isNew: boolean) {
        this.id = id;
        this.name = name;
        this.isNew = isNew;
    }

    public static fromAPI(apiSector: APISector): Sector {
        return new Sector(String(apiSector.id), apiSector.name, false);
    }

    public static create(name: string): Sector {
        return new Sector(NEW_ENTITY_PREFIX + String(Sector.CURRENT_ID++), name, true);
    }

    public toAPISector(): APISector {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            name: this.name
        }
    }
}