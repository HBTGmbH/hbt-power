import {APISectorEntry} from './APIProfile';
import {Sector} from './Sector';
import * as Immutable from 'immutable';

export class SectorEntry {
    public readonly id: number;
    public readonly sectorId: number;

    /**
     * Constructor is left private to disallow any manual constructing, enforcing fallback
     * to the factory methods.
     * @param id
     * @param sectorId
     */
    private constructor(id: number, sectorId: number) {
        this.id = id;
        this.sectorId = sectorId;
    }

    static create(apiSectorEntry: APISectorEntry): SectorEntry {
        return new SectorEntry(Number(apiSectorEntry.id), Number(apiSectorEntry.sector.id))
    }

    /**
     * Creates a {@link SectorEntry} without setting it's {@link SectorEntry.id}, leaving it null. The resulting
     * entry should not be used within the application, but only for API communication.
     * @param sectorId
     */
    static createWithoutId(sectorId: number): SectorEntry {
        return new SectorEntry(null, sectorId);
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