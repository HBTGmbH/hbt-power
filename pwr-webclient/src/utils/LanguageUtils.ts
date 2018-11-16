export namespace LanguageUtils {
    declare const ISO_639_2_DATA: any;

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
        return ISO_639_2_DATA[code];
    }

    export function getAllISO639_2LanguageCodes(): Array<ISO639_2DataSet> {
        let keys: Array<string> = Object.keys(ISO_639_2_DATA);
        let result: Array<ISO639_2DataSet> = [];
        keys.forEach((value, index, array) => {
            let toAdd = Object.assign({code: value}, ISO_639_2_DATA[value]);
            result.push(toAdd);
        });
        return result;
    }
}