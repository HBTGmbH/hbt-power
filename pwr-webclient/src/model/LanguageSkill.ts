import {Language} from './Language';
import {APILanguageSkill} from './APIProfile';
import * as Immutable from 'immutable';
import {DEFAULT_LANG_LEVEL, NEW_ENTITY_PREFIX, UNDEFINED_ID} from './PwrConstants';

/**
 * Consist of a language name and a level that rates this language name. Together, they represent a certain language level
 * that is represented by natural language instead of formal definitions.
 * <p>
 *
 * </p>
 */
export class LanguageSkill {

    /**
     *
     */
    public readonly id: string;


    /**
     * The language itself.
     */
    public readonly languageId: string;

    /**
     * The language level, represented as a string. On the server side, these levels are enumerated values, but due
     * to bad type-/javascript support of enums, it is kept as a string.
     */
    public readonly level: string;

    public readonly isNew: boolean;

    private static CURRENT_ID: number = 0;

    private constructor(id: string, languageId: string, level: string, isNew: boolean) {
        this.id = id;
        this.languageId = languageId;
        this.level = level;
        this.isNew = isNew;
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

    /**
     * Fixme doc.
     * @param newLanguageLevel
     * @returns {LanguageSkill}
     */
    public changeLevel(newLanguageLevel: string): LanguageSkill {
        return new LanguageSkill(this.id, this.languageId, newLanguageLevel, this.isNew);
    }

    /**
     * FIXME doc
     * @param newLanguageId
     * @returns {LanguageSkill}
     */
    public changeLanguageId(newLanguageId: string): LanguageSkill {
        return new LanguageSkill(this.id, newLanguageId, this.level, this.isNew);
    }

    public toAPILanguageSkill(languagesById: Immutable.Map<string, Language>) : APILanguageSkill {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            level: this.level,
            language: this.languageId == null ? null : languagesById.get(this.languageId).toAPI()
        };
    }
}