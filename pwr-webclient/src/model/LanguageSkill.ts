import {Language} from './Language';
import {APILanguageSkill} from './APIProfile';
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
    id: number;
    /**
     * The language itself.
     */
    languageId: number;

    /**
     * The language level, represented as a string. On the server side, these levels are enumerated values, but due
     * to bad type-/javascript support of enums, it is kept as a string.
     */
    level: string;

    static toAPILanguageSkill(langSkill: LanguageSkill, languagesById: Array<Language>) : APILanguageSkill {
        return {
            id: langSkill.id,
            level: langSkill.level,
            language: {
                id: langSkill.languageId,
                name: languagesById[langSkill.languageId].name
            }

        };
    }
}