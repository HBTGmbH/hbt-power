import {FurtherTraining} from './FurtherTraining';
import {Career} from './Career';
import {SpecialField} from './SpecialField';
import {Language} from './Language';
import {Qualification} from './Qualification';
import {Education} from './Education';
import {IndustrialSector} from './IndustrialSector';
import {ProfileSkill} from './ProfileSkill';
import {Project} from './Project';

export interface Profile {
    id: number;
    description: string;
    lastEdited: string;
    trainings: Array<FurtherTraining>;
    careers: Array<Career>;
    specialFieldEntries: Array<SpecialField>;
    languages: Array<Language>;
    qualification: Array<Qualification>;
    education: Array<Education>;
    sectors: Array<IndustrialSector>;
    projects: Array<Project>;
    skills: Array<ProfileSkill>;
}

export const emptyProfile = (): Profile => {
    return {
        projects: [],
        trainings: [],
        careers: [],
        specialFieldEntries: [],
        languages: [],
        qualification: [],
        sectors: [],
        description: '',
        id: null,
        education: [],
        lastEdited: null,
        skills: []
    };
};
