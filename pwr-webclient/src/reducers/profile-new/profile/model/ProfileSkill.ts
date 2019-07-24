export interface ProfileSkill {
    id: number,
    name: string,
    rating: number
}

export function newProfileSkill(id: number, name: string, rating: number): ProfileSkill {
    return {
        id: id,
        name: name,
        rating: rating
    };
}