export class StringUtils {
    public static formatString(val: string, ...args: any[]): string {
        return val.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined'
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

    /**
     * Readable part of a URL from a name (#180): lower case, umlauts spelled out, everything else but a-z and 0-9
     * becomes a hyphen. Only for reading, the URL is evaluated by the ID in front of it.
     */
    public static slug(value?: string): string {
        return (value || '').toLowerCase()
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .replace(/\+/g, ' plus ').replace(/#/g, ' sharp ')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    public static dateToString(date: Date) {
        if (date == null) {
            return '';
        }
        return date.toString();
    }
}
