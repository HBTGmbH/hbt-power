import * as Immutable from 'immutable';

export function toArray<T>(list?: Immutable.List<T>) {
    if (!list) {
        return [];
    } else {
        return list.toArray();
    }
}