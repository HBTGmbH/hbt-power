declare const POWER_IMAGE_PATH: string;

export function getImagePath(): string {
    return POWER_IMAGE_PATH;
}

export function getProfileImageLocation(initials: string): string {
    return POWER_IMAGE_PATH + '/profile_pictures/foto_' + initials + '.jpg';
}



