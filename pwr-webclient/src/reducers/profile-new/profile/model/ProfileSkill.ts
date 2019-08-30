export interface ProfileSkill {
    id: number,
    name: string,
    rating: number
}

export function newProfileSkill(name: string, rating: number): ProfileSkill {
    return {
        id: null,
        name: name,
        rating: rating
    };
}
