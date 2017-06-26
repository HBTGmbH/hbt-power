
import {PowerLocalize} from '../localization/PowerLocalizer';
export function formatString(val: string, ...args: string[]): string {
    return val.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
}

export function langLevelToLocalizedString(level: string): string {
    return PowerLocalize.get("LanguageLevel." + level);
}

export function trimURL(url: string) {
    return url.substring(url.lastIndexOf('/') + 1);
}