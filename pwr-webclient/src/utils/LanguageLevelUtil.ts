import {LanguageLevel} from '../Store';
/**
 * Created by nt on 20.04.2017.
 */
export class LanguageLevelUtil {
    static getValues() : LanguageLevel[] {
        return [LanguageLevel.Beginner, LanguageLevel.Apprentice, LanguageLevel.Expert, LanguageLevel.Native];
    }

    /**
     * Bad hacking
     * @param val
     * @returns {any}
     */
    static fromString(val: any ): LanguageLevel {
        if(val == "Beginner") {
            return LanguageLevel.Beginner;
        }
        if(val == "Apprentice") {
            return LanguageLevel.Apprentice;
        }
        if(val == "Expert") {
            return LanguageLevel.Expert;
        }
        if(val == "Native") {
            return LanguageLevel.Native;
        }
        return null;
    }

    static getDisplayString(level: LanguageLevel) {
        switch(level) {
            case LanguageLevel.Native:
                return "Muttersprache";
            case LanguageLevel.Beginner:
                return "Anfänger";
            case LanguageLevel.Apprentice:
                return "Fortgeschritten";
            case LanguageLevel.Expert:
                return "Verhandlungssicher";
            default:
                return "Unknown LangLevel; Report to Dev";
        }
    }

    /**
     * Allows using of the cast in tsx files.
     * @param index
     * @returns {LanguageLevel}
     */
    static getLevel(index: number) : LanguageLevel {
        return <LanguageLevel> index;
    }
}