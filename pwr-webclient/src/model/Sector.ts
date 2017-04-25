import {APISector} from './APIProfile';
export class Sector {
    readonly id: number;
    readonly name: string;

    public constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    public static create(apiSector: APISector): Sector {
        return new Sector(apiSector.id, apiSector.name);
    }

    public toAPISector(): APISector {
        return {
            id: this.id,
            name: this.name
        }
    }

}