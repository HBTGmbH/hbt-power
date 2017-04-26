import {APISectorEntry} from './APIProfile';
import {Sector} from './Sector';
import * as Immutable from 'immutable';

export class SectorEntry {
    public readonly id: number;
    public readonly sectorId: number;

    constructor(id: number, sectorId: number) {
        this.id = id;
        this.sectorId = sectorId;
    }

    static create(apiSectorEntry: APISectorEntry): SectorEntry {
        return new SectorEntry(apiSectorEntry.id, apiSectorEntry.sector.id)
    }

    public changeSectorId(newSectorId: number): SectorEntry {
        return new SectorEntry(this.id, newSectorId);
    }

    public toAPISectorEntry(sectors: Immutable.Map<number, Sector>): APISectorEntry {
        return {
            id: this.id, //FIXME correct
            sector: sectors.get(this.sectorId)
        }
    }

}