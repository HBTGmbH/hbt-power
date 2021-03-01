import {doop} from 'doop';

export interface APIBuildInfo {
    build: {
        version: string;
        artifact: string;
        name: string;
        group: string;
        time: string;
        swaggerHref?: string; // Manually appended
    }
}

@doop
export class BuildInfo {
    @doop
    public get version() {
        return doop<string, this>();
    }

    @doop
    public get artifact() {
        return doop<string, this>();
    };

    @doop
    public get name() {
        return doop<string, this>();
    };

    @doop
    public get group() {
        return doop<string, this>();
    };

    @doop
    public get time() {
        return doop<Date, this>();
    };

    @doop
    public get available() {
        return doop<boolean, this>();
    };

    @doop
    public get swaggerRef() {
        return doop<string, this>();
    }


    constructor(version: string, artifact: string, name: string, group: string, time: Date, available: boolean, swaggerRef: string) {
        return this.version(version).artifact(artifact).name(name).group(group).time(time).available(available).swaggerRef(swaggerRef);
    }

    public static of(apiBuildInfo: APIBuildInfo) {
        return new BuildInfo(
            apiBuildInfo.build.version,
            apiBuildInfo.build.artifact,
            apiBuildInfo.build.name,
            apiBuildInfo.build.group,
            new Date(apiBuildInfo.build.time),
            true,
            apiBuildInfo.build.swaggerHref || ''
        );
    }

    public static offline(service: string): BuildInfo {
        return new BuildInfo('', '', service, '', new Date(), false, '');
    }
}
