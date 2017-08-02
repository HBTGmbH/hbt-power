import {doop} from 'doop';
export interface APILocalizedQualifier {
    /**
     * Technical ID
     */
    id: number;
    /**
     * ISO-3 language string(ISO 639-2/T 3 letter code)
     */
    locale: string;
    /**
     * The localization
     */
    qualifier: string;
}

@doop
export class LocalizedQualifier {
    @doop public get id() {return doop<number, this>()};
    @doop public get locale() {return doop<string, this>()};
    @doop public get qualifier() {return doop<string, this>()};

    private constructor(id: number, locale: string, qualifier: string) {
        return this.id(id).locale(locale).qualifier(qualifier);
    }

    public static of(id: number, locale: string, qualifier: string) {
        return new LocalizedQualifier(id, locale, qualifier);
    }

    public static fromAPI(api: APILocalizedQualifier) {
        return new LocalizedQualifier(api.id, api.locale, api.qualifier);
    }
}