export class ClientBuildInfo {
    version: string;
    date: Date;
    builder: string;


    private constructor(version: string, date: Date, builder: string) {
        this.version = version;
        this.date = date;
        this.builder = builder;
    }

    public static of(clientBuildInfo: ClientBuildInfo) {
        if (clientBuildInfo == null) {
            return null;
        } else {
            return new ClientBuildInfo(
                clientBuildInfo.version,
                new Date(clientBuildInfo.date),
                clientBuildInfo.builder
            );
        }
    }

}