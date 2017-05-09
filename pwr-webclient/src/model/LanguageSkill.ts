import {APILanguageSkill} from './APIProfile';
import * as Immutable from 'immutable';
import {DEFAULT_LANG_LEVEL, NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';
import {NameEntity} from './NameEntity';
import {doop} from 'doop';

/**
 * Consist of a language name and a level that rates this language name. Together, they represent a certain language level
 * that is represented by natural language instead of formal definitions.
 * <p>
 *
 * </p>
 */
@doop
export class LanguageSkill {


    @doop
    public get id() {return doop<string, this>()}


    /**
     * The language itself.
     */
    @doop
    public get languageId() { return doop<string, this>()}

    /**
     * The language level, represented as a string. On the server side, these levels are enumerated values, but due
     * to bad type-/javascript support of enums, it is kept as a string.
     */
    @doop
    public get level() { return doop<string, this>()}

    @doop
    public get isNew() { return doop<boolean, this>()}

    private static CURRENT_ID: number = 0;

    private constructor(id: string, languageId: string, level: string, isNew: boolean) {
        return this.id(id).languageId(languageId).level(level).isNew(isNew);
    }

    /**
     * FIXME doc
     * @param apiLanguageSkill
     */
    public static fromAPI(apiLanguageSkill: APILanguageSkill) {
        return new LanguageSkill(
            String(apiLanguageSkill.id),
            String(apiLanguageSkill.language.id),
            apiLanguageSkill.level,
            false);
    }

    /**
     * Fixme !important document
     * @returns {LanguageSkill}
     */
    public static createNew(): LanguageSkill {
        return new LanguageSkill(
            NEW_ENTITY_PREFIX + String(LanguageSkill.CURRENT_ID++),
            UNDEFINED_ID,
            DEFAULT_LANG_LEVEL,
            true
        )
    }

    public toAPILanguageSkill(languagesById: Immutable.Map<string, NameEntity>) : APILanguageSkill {
        return {
            id: this.isNew() ? null : Number.parseInt(this.id()),
            level: this.level(),
            language: this.languageId() == null ? null : languagesById.get(this.languageId()).toAPI()
        };
    }
}