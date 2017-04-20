/**
 * Created by nt on 20.04.2017.
 */
import {de_locale} from './de_locale';
/**
 *
 */
export class PowerLocalize {
    /**
     * The locale string that is currently used.
     */
    private static locale: string = "de-de";

    private static localization: any;

    public static setLocale(locale: string) {
        if(locale === "de-de") {
            this.localization = de_locale;
        } else {
            console.log("No localization available for " + locale + ". Using default de-de");
            this.localization = de_locale;
        }
    }

    public static get(field: string) : string {
        return this.localization[field];
    }
}