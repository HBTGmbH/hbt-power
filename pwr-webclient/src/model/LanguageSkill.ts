import {Language} from './Language';
/**
 * Consist of a language name and a level that rates this language name. Together, they represent a certain language level
 * that is represented by natural language instead of formal definitions.
 * <p>
 *
 * </p>
 */
export interface LanguageSkill {

    /**
     * The language itself.
     */
    language: Language;

    /**
     * The language level, represented as a string. On the server side, these levels are enumerated values, but due
     * to bad type-/javascript support of enums, it is kept as a string.
     */
    level: string;
}