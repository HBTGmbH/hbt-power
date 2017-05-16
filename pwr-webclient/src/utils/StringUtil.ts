
export function formatString(val: string, ...args: string[]): string {
    return val.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
}