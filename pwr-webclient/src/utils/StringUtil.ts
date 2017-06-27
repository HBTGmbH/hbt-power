
import {PowerLocalize} from '../localization/PowerLocalizer';
export function formatString(val: string, ...args: string[]): string {
    return val.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
}

export function compareString(s1:string, s2:string): number {
    if(s1 > s2) return -1;
    if(s1 == s2) return 0;
    return 1;
}

export function langLevelToLocalizedString(level: string): string {
    return PowerLocalize.get("LanguageLevel." + level);
}

export function trimURL(url: string) {
    return url.substring(url.lastIndexOf('/') + 1);
}