/**
 * Version and commit of one component (webclient, edge or service), as published by the component itself
 */
export interface ComponentInfo {
    name: string;
    available: boolean;
    version?: string;
    /** Short commit hash */
    commitId?: string;
    commitTime?: Date;
}

/**
 * Spring Boot publishes times as ISO strings or, depending on the Jackson configuration of the service, as epoch
 * seconds (number or numeric string)
 */
export function toDate(value: unknown): Date | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const date = typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value))
        ? new Date(Number(value) * 1000)
        : new Date(String(value));
    return isNaN(date.getTime()) ? undefined : date;
}

/** GET /actuator/info of a Spring Boot service (build-info and git.properties) */
export interface ActuatorInfo {
    build?: { version?: string; time?: unknown };
    git?: { branch?: string; commit?: { id?: string; time?: unknown } };
}

export function ofActuatorInfo(name: string, info: ActuatorInfo): ComponentInfo {
    return {
        name,
        available: true,
        version: info.build && info.build.version,
        commitId: info.git && info.git.commit && info.git.commit.id,
        commitTime: toDate(info.git && info.git.commit && info.git.commit.time),
    };
}

/** build_info.json of the webclient (compileBuildInfo.js) */
export interface ClientInfo {
    version?: string;
    commit?: string;
    commitTime?: string;
}

export function ofClientInfo(name: string, info: ClientInfo): ComponentInfo {
    return {
        name,
        available: true,
        version: info.version,
        commitId: info.commit ? info.commit.substring(0, 7) : undefined,
        commitTime: toDate(info.commitTime),
    };
}

export function unavailable(name: string): ComponentInfo {
    return {name, available: false};
}
