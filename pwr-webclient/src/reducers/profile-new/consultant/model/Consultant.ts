import {LocalDate} from '../../../../utils/DateUtil';

export interface Consultant {
    initials: string;
    firstName: string;
    lastName: string;
    title: string;
    profileId: number;
    birthDate: LocalDate;
    profileLastUpdated: string;
    active: boolean;
    profilePictureId: string;
}

export function emptyConsultant(): Consultant {
    return {
        initials: null,
        firstName: null,
        lastName: null,
        title: null,
        profileId: null,
        birthDate: null,
        active: false,
        profilePictureId: null,
        profileLastUpdated: null
    };
}

