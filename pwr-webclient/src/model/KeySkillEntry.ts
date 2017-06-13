import {doop} from 'doop';
import {APIKeySkill} from './APIProfile';
import {NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';
@doop
export class KeySkillEntry {
    @doop
    public get id(){ return doop<string,this>()}
    @doop
    public get nameEntityId(){ return doop<string,this>()}
    @doop
    public get isNew(){ return doop<boolean,this>()}


    private static CURRENT_ID: number = 0;


    /**
     *
     * @param id
     * @param nameEntityId
     * @param isNew
     */
    private constructor(id: string, nameEntityId: string, isNew: boolean) {
        this.id(id).nameEntityId(nameEntityId).isNew(isNew);
    }

    static fromAPI(apiKeySkill: APIKeySkill): KeySkillEntry {
        return new KeySkillEntry(
            String(apiKeySkill.id),
            String(apiKeySkill.nameEntity.id),
            false)
    }

    static createNew(): KeySkillEntry {
        return new KeySkillEntry(NEW_ENTITY_PREFIX + String(KeySkillEntry.CURRENT_ID++), UNDEFINED_ID, true);
    }

    public toAPI(keySkills: Immutable.Map<string, NameEntity>): APIKeySkill {
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            nameEntity: this.nameEntityId() == UNDEFINED_ID ? null : keySkills.get(this.nameEntityId()).toAPI()
        };
    }
}