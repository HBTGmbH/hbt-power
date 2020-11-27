import {Profile} from '../../profile/model/Profile';

export interface Consultant {
    initials: string;
    firstName: string;
    lastName: string;
    title: string;
    profileId: number;
    birthDate: Date;
    active: boolean;
}

export function emptyConsultant(): Consultant {
    return {
        initials: null,
        firstName: null,
        lastName: null,
        title: null,
        profileId: null,
        birthDate: null,
        active: false
    };
}

