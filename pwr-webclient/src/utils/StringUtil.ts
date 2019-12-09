export namespace StringUtils {
    export function formatString(val: string, ...args: any[]): string {
        return val.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    }

    export function trimURL(url: string) {
        return url.substring(url.lastIndexOf('/') + 1);
    }

    /**
     * 'Stolen' from material-ui/autocomplete
     */
    export function filterFuzzy(searchText: string, key: string): boolean {
        const compareString = key.toLowerCase();
        searchText = searchText.toLowerCase();

        let searchTextIndex = 0;
        for (let index = 0; index < key.length; index++) {
            if (compareString[index] === searchText[searchTextIndex]) {
                searchTextIndex += 1;
            }
        }

        return searchTextIndex === searchText.length;
    }

    export function noOpFilter(searchText: string, key: string): boolean {
        return true;
    }

    export function defaultString(value?: string) {
        if (value) {
            return value;
        }
        return '';
    }

    export function dateToString(date: Date) {
        if (date == null) {
            return '';
        }
        return date.toString();
    }
}
