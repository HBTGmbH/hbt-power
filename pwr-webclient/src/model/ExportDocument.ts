import {doop} from 'doop';
export interface APIExportDocument {
    name: string;
    location: string;
    type: string;
}

@doop
export class ExportDocument {

    @doop public get name() {return doop<string, this>()};
    @doop public get location() {return doop<string, this>()};
    @doop public get type() {return doop<string, this>()};

    private constructor(name: string, location: string, type: string) {
        return this.name(name).location(location).type(type);
    }

    public static fromAPI(apiExportDocument: APIExportDocument) {
        return new ExportDocument(apiExportDocument.name, apiExportDocument.location, apiExportDocument.type);
    }
}