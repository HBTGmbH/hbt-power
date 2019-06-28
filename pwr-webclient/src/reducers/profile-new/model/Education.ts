import {ProfileEntry} from './ProfileEntry';

export interface Education extends ProfileEntry {
    startDate: Date;
    endDate: Date;
    degree: string;
}