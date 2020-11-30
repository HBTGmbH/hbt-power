export interface APINameEntity {
    id: number;
    name: string;
    type: string;
}

export interface APISkill {
    id: string,
    name: string,
    rating: number
    comment: string;
}

/**
 * Just the relevant information
 */
export interface APIConsultant {
    initials: string;
    firstName: string;
    lastName: string;
    title: string;
    birthDate: string;
    active: boolean;
    profilePictureId?: string;
}
