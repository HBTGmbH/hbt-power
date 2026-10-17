import ISO_639_2_DATA from './iso_639-2.json';

export interface ISO639_2DataSet {
    code: string;
    int: Array<string>;
    native: Array<string>;
}

export class LanguageUtils {

    public static getAllISO639_2LanguageCodes(): Array<ISO639_2DataSet> {
        let keys: Array<string> = Object.keys(ISO_639_2_DATA);
        let result: Array<ISO639_2DataSet> = [];
        keys.forEach((value, index, array) => {
            let toAdd = Object.assign({code: value}, ISO_639_2_DATA[value]);
            result.push(toAdd);
        });
        return result;
    }
}
