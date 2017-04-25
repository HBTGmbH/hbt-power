import {APILanguage} from './APIProfile';
/**
 * Single, immutable language. These languages are usually provided by the API and should not get changed.
 */
export class Language {
    readonly id: number;
    readonly name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    public static create(apiLanguage: APILanguage): Language {
        return new Language(apiLanguage.id, apiLanguage.name);
    }
}