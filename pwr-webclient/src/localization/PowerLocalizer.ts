/**
 * Created by nt on 20.04.2017.
 */
import {StringUtils} from '../utils/StringUtil';
import deDE from './de-DE.json';
import formatString = StringUtils.formatString;

/**
 * Quick localizer that localizes localizations. For localizing locales.
 *
 */
export class PowerLocalize {

    /**
     * String returned when an unknown field name was given to the localizer.
     * @type {string}
     */
    public static readonly noLocalizationFound = 'NO_LOCALE';


    /**
     * The localization that is currently used,represented by a json object that uses strings as fields.
     */
    private static localization: any = {};

    public static setLocale(): void {
        this.localization = deDE;
    }


    /**
     * Returns a localized string for the given field name. If no localization has been found,
     * {@link PowerLocalize.noLocalizationFound} is returned.
     * The localization file which is used is defined by the {@link PowerLocalize.setLocale} method.
     * @param field field name
     * @returns {any} localized strings.
     */
    public static get(field: string): string {
        let val = this.localization[field];
        if (!val) {
            return field + '_' + PowerLocalize.noLocalizationFound;
        }
        return String(val);
    }

    public static getFormatted(field: string, ...args: any[]): string {
        let val = PowerLocalize.get(field);
        return formatString(val, ...args);
    }


    public static langLevelToLocalizedString(level: string): string {
        return PowerLocalize.get('LanguageLevel.' + level);
    }
}
