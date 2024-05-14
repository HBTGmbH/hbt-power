export class StringUtils {
    public static formatString(val: string, ...args: any[]): string {
        return val.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    }

    /**
     * 'Stolen' from material-ui/autocomplete
     */
    public static filterFuzzy(searchText: string, key: string): boolean {
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

    public static defaultString(value?: string) {
        if (value) {
            return value;
        }
        return '';
    }

    public static dateToString(date: Date) {
        if (date == null) {
            return '';
        }
        return date.toString();
    }
}
