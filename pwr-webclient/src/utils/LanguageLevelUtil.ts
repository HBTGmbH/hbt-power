import {LanguageLevel} from '../Store';
/**
 * Created by nt on 20.04.2017.
 */
export class LanguageLevelUtil {
    static getValues() : LanguageLevel[] {
        return [LanguageLevel.Beginner, LanguageLevel.Apprentice, LanguageLevel.Expert, LanguageLevel.Native];
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