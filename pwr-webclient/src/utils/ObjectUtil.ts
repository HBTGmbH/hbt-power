// Um obj vollständig unveränderbar zu machen, friere jedes Objekt in obj ein.
export function deepFreeze(obj: Object) {

    // Ermittle die Namen der für obj definierten Eigenschaften
    var propNames = Object.getOwnPropertyNames(obj);

    // Friere die Eigenschaften ein, bevor obj selbst eingefroren wird
    propNames.forEach(function(name) {
        var prop = obj[name];

        // Friere prop ein wenn es ein Objekt ist
        if (typeof prop == 'object' && prop !== null)
            deepFreeze(prop);
    });

    // Friere obj selbst ein
    return Object.freeze(obj);
}

export function deepClone(o: Object): any {
    let _out, v, _key;
    _out = Array.isArray(o) ? [] : {};
    for (_key in o) {
        v = o[_key];
        _out[_key] = (typeof v === "object") ? deepClone(v) : v;
    }
    return _out;
}

export function levenshtein(a: string, b: string): number
{
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0)
    {
        return bn;
    }
    if (bn === 0)
    {
        return an;
    }
    const matrix = new Array<number[]>(bn + 1);
    for (let i = 0; i <= bn; ++i)
    {
        let row = matrix[i] = new Array<number>(an + 1);
        row[0] = i;
    }
    const firstRow = matrix[0];
    for (let j = 1; j <= an; ++j)
    {
        firstRow[j] = j;
    }
    for (let i = 1; i <= bn; ++i)
    {
        for (let j = 1; j <= an; ++j)
        {
            if (b.charAt(i - 1) === a.charAt(j - 1))
            {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else
            {
                matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1], // substitution
                        matrix[i][j - 1], // insertion
                        matrix[i - 1][j] // deletion
                    ) + 1;
            }
        }
    }
    return matrix[bn][an];
}

export function compareNumbers(n1: number, n2: number) {
    if(n1 > n2) return -1;
    if(n1 == n2) return 0;
    return 1;
}

