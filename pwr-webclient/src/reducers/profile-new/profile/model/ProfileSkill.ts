export interface ProfileSkill {
    id: number,
    name: string,
    rating: number,
    versions:string[]
}

export function newProfileSkill(name: string, rating: number,versions: string[]): ProfileSkill {
    return {
        id: null,
        name: name,
        rating: rating,
        versions:versions
    };
}
