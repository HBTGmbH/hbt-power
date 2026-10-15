
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

export class LocalizedQualifier {
    private readonly _id: number;
    private readonly _locale: string;
    private readonly _qualifier: string;


    public id() {
        return this._id;
    };

    public locale() {
        return this._locale;
    };

    public qualifier() {
        return this._qualifier;
    };

    private constructor(id: number, locale: string, qualifier: string) {
        this._id = id;
        this._locale = locale;
        this._qualifier = qualifier;
    }

    public static of(id: number, locale: string, qualifier: string) {
        return new LocalizedQualifier(id, locale, qualifier);
    }

    public static fromAPI(api: APILocalizedQualifier) {
        return new LocalizedQualifier(api.id, api.locale, api.qualifier);
    }
}
