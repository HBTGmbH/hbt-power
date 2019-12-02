declare const POWER_API_HOST_STATISTICS: string;

declare const POWER_API_SUFFIX_STATISTICS: string;

declare const POWER_API_PORT_STATISTICS: string;

declare const POWER_API_HOST_SKILL: string;

declare const POWER_API_PORT_SKILL: string;

declare const POWER_API_SUFFIX_SKILL: string;

declare const POWER_API_META_INFO_REPORT: string;

declare const POWER_IMAGE_PATH: string;

// View Profile
declare const POWER_API_HOST_VIEW: string;
declare const POWER_API_PORT_VIEW: string;
declare const POWER_API_SUFFIX_VIEW: string;

export function getImagePath(): string {
    return POWER_IMAGE_PATH;
}

export function getStatisticsBuildsInfo(): string {
    return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS + '/meta/info';
}

export function getSkillBuildInfo(): string {
    return POWER_API_HOST_SKILL + ':' + POWER_API_PORT_SKILL + POWER_API_SUFFIX_SKILL + '/meta/info';
}

export function getReportBuildInfo(): string {
    return POWER_API_META_INFO_REPORT + '/actuator/info';
}


export function getProfileImageLocation(initials: string): string {
    return POWER_IMAGE_PATH + '/profile_pictures/foto_' + initials + '.jpg';
}



