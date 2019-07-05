export interface NameEntity {
    id: number;
    name: string;
    type: string;
}

export function newNameEntity(id: number, name: string, type: string): NameEntity {
    return {
        id: id,
        name: name,
        type: type
    };
}