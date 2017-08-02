export namespace LanguageUtils {
    const iso639_2data = require("./../resources/iso_639-2.json");

    interface _ISO639_2Data {
        int: string;
        native: string;
    }
    
    export interface ISO639_2DataSet {
        code: string;
        int: Array<string>;
        native: Array<string>;
    }

    export function getISO639_2LanguageCode(code: string): _ISO639_2Data {
        return iso639_2data[code];
    }

    export function getAllISO639_2LanguageCodes(): Array<ISO639_2DataSet> {
        let keys: Array<string> = Object.keys(iso639_2data);
        let result: Array<ISO639_2DataSet> = [];
        keys.forEach((value, index, array) => {
            let toAdd = Object.assign({code: value}, iso639_2data[value]);
            result.push(toAdd);
        });
        return result;
    }
}