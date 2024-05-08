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

export interface BuildInfo {
    version: string;
    artifact: string;
    name: string;
    group: string;
    time: Date;
    available: boolean;
    swaggerRef: string;
}

export function ofAPIBuildInfo(apiBuildInfo: APIBuildInfo): BuildInfo {
    return {
        version: apiBuildInfo.build.version,
        artifact: apiBuildInfo.build.artifact,
        name: apiBuildInfo.build.name,
        group: apiBuildInfo.build.name,
        time: new Date(apiBuildInfo.build.time),
        available: true,
        swaggerRef: apiBuildInfo.build.swaggerHref
    }
}

export function offlineBuildInfo(service: string): BuildInfo {
    return {
        version: '',
        artifact: '',
        name: service,
        group: '',
        time: new Date(),
        available: false,
        swaggerRef: ''
    }
}
