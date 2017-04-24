import {APISector} from './APIProfile';
export class Sector {
    id: number;
    name: string;

    public static toAPISector(sector: Sector): APISector {
        return {
            id: sector.id,
            name: sector.name
        }
    }

}