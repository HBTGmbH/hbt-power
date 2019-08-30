export interface BaseProfile {
    id: number;
    description: string;
    lastEdited: string;
}

export function newBaseProfile(id: number, description: string, lastEdited: string) {
    return {
        id: id,
        description: description,
        lastEdited: lastEdited,
    };
}