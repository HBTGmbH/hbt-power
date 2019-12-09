import * as Immutable from 'immutable';

export function toArray<T>(list?: Immutable.List<T>) {
    if (!list) {
        return [];
    } else {
        return list.toArray();
    }
}


/**
 * Replaces the entry at the given index in the collection. The returned array is a copy of the original array.
 */
export function replaceAtIndex<Entry>(entry: Entry, array: Array<Entry>, index: number): Array<Entry> {
    if (array.length === 0) {
        throw new Error('Cannot replace an item in an empty array');
    }
    if (array.length === 1) {
        return [entry];
    }
    return [...array.slice(0, index), entry, ...array.slice(index + 1, array.length)];
}

export function immutablePush<Entry>(entry: Entry, array: Array<Entry>): Array<Entry> {
    return [...array, entry];
}

export function immutableUnshift<Entry>(entry: Entry, array: Array<Entry>): Array<Entry> {
    return [entry, ...array];
}

export function immutableRemove<Entry>(entry: Entry, array: Array<Entry>): Array<Entry> {
    return array.filter(element => element !== entry);
}
