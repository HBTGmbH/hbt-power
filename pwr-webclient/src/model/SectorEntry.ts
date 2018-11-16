import {APISectorEntry} from './APIProfile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';
import {doop} from 'doop';

@doop
export class SectorEntry {
    @doop
    public get id() {
        return doop<string, this>();
    }

    @doop
    public get sectorId() {
        return doop<string, this>();
    }

    @doop
    public get isNew() {
        return doop<boolean, this>();
    }


    private static CURRENT_ID: number = 0;

    /**
     * Constructor is left private to disallow any manual constructing, enforcing fallback
     * to the factory methods.
     * @param id
     * @param localId
     * @param sectorId
     */
    private constructor(id: string, sectorId: string, isNew: boolean) {
        this.id(id).sectorId(sectorId).isNew(isNew);
    }

    static create(apiSectorEntry: APISectorEntry): SectorEntry {
        return new SectorEntry(
            String(apiSectorEntry.id),
            String(apiSectorEntry.nameEntity.id),
            false);
    }

    static createNew(): SectorEntry {
        return new SectorEntry(NEW_ENTITY_PREFIX + String(SectorEntry.CURRENT_ID++), UNDEFINED_ID, true);
    }

    public toAPISectorEntry(sectors: Immutable.Map<string, NameEntity>): APISectorEntry {
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            nameEntity: this.sectorId() == UNDEFINED_ID ? null : sectors.get(this.sectorId()).toAPI()
        };
    }

}