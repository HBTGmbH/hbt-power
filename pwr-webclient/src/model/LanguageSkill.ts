import {Language} from './Language';
import {APILanguageSkill} from './APIProfile';
import * as Immutable from 'immutable';

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
    readonly id: number;
    /**
     * The language itself.
     */
    readonly languageId: number;

    /**
     * The language level, represented as a string. On the server side, these levels are enumerated values, but due
     * to bad type-/javascript support of enums, it is kept as a string.
     */
    readonly level: string;

    public constructor(id: number, languageId: number, level: string) {
        this.id = id;
        this.languageId = languageId;
        this.level = level;
    }

    /**
     * FIXME doc
     * @param apiLanguageSkill
     */
    public static create(apiLanguageSkill: APILanguageSkill) {
        return new LanguageSkill(apiLanguageSkill.id, apiLanguageSkill.language.id, apiLanguageSkill.level);
    }

    /**
     * Fixme doc.
     * @param newLanguageLevel
     * @returns {LanguageSkill}
     */
    public changeLevel(newLanguageLevel: string): LanguageSkill {
        return new LanguageSkill(this.id, this.languageId, newLanguageLevel);
    }

    /**
     * FIXME doc
     * @param newLanguageId
     * @returns {LanguageSkill}
     */
    public changeLanguageId(newLanguageId: number): LanguageSkill {
        return new LanguageSkill(this.id, newLanguageId, this.level);
    }

    public toAPILanguageSkill(languagesById: Immutable.Map<number, Language>) : APILanguageSkill {
        return {
            id: this.id,
            level: this.level,
            language: {
                id: this.languageId,
                name: languagesById.get(this.languageId).name
            }
        };
    }
}