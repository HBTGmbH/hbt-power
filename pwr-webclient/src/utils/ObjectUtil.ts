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