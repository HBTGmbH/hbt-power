/**
 * Created by nt on 20.04.2017.
 */
import {isNullOrUndefined} from 'util';
import {StringUtils} from '../utils/StringUtil';
import formatString = StringUtils.formatString;
import axios, {AxiosError} from 'axios';

/**
 * Quick localizer that localizes localizations. For localizing locales.
 *
 */
export class PowerLocalize {

    /**
     * Default locale used when an unknown locale string was provided
     * @type {string}
     */
    public static readonly defaultLocale = 'de-DE';

    /**
     * String returned when an unknown field name was given to the localizer.
     * @type {string}
     */
    public static readonly noLocalizationFound = 'NO_LOCALE';

    /**
     * The locale string that is currently used.
     */
    private static locale: string = 'de';

    /**
     * The localization that is currently used,represented by a json object that uses strings as fields.
     */
    private static localization: any = {};

    /**
     * Sets the locale for the localizer. If no localization was found, the {@link PowerLocalize.defaultLocale} will be used.
     * @param locale the new locale. Has to be a valid ISO language code (https://www.w3schools.com/tags/ref_language_codes.asp)
     */
    public static setLocale(locale: string): Promise<any> {
        return this.resolveLocale(locale);
    }

    private static resolveLocale(locale: string): Promise<any> {
        const basePath = POWER_LOCALE_PATH;
        return axios.get(`${basePath}/${locale}.json`)
            .then(response => response.data)
            .then(localeData => PowerLocalize.localization = localeData)
            .catch((error: AxiosError) => this.handleLocaleError(locale, error))
    }

    private static async handleLocaleError(locale: string, error: AxiosError) {
        if (error.code == '404' && locale !== this.defaultLocale) {
            console.log(`Locale ${locale} not found. Falling back to default ${PowerLocalize.defaultLocale}`);
            await PowerLocalize.resolveLocale(this.defaultLocale);
        } else {
            console.log(`Locale ${locale} cant be resolved: `, error);
        }
        return null;
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
        if (isNullOrUndefined(val)) return field + '_' + PowerLocalize.noLocalizationFound;
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
