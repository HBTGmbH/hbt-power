import {APILanguage} from './APIProfile';
/**
 * Single, immutable language. These languages are usually provided by the API and should not get changed.
 */
export class Language {
    public readonly id: string;
    public readonly name: string;
    public readonly isNew: boolean;

    private static CURRENT_ID: number = 0;

    private constructor(id: string, name: string, isNew: boolean) {
        this.id = id;
        this.name = name;
        this.isNew = isNew
    }

    public static fromAPI(apiLanguage: APILanguage): Language {
        return new Language(String(apiLanguage.id), apiLanguage.name, false);
    }

    public toAPI(): APILanguage {
        return {
            id: this.isNew ? null : Number.parseInt(this.id),
            name: this.name
        }
    }

}