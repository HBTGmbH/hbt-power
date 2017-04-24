import {CareerElement} from './CareerElement';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {EducationEntry} from './EducationEntry';
import {Sector} from './Sector';

export interface Profile {
    id: number;
    description: string;
    currentPosition: string;
    career: Array<CareerElement>;
    languages: Array<LanguageSkill>;
    qualification: Array<QualificationEntry>;
    education: Array<EducationEntry>;
    sectors: Array<Sector>;
}

export class NormalizedProfile {
    public id: number;
    public description: string;
    public currentPosition: string;
    /**
     * The career elements, referenced by ID. The actual career elements are stored
     * in the normalized database.
     */
    public career: Array<number>;
    /**
     * The languages, referenced by ID. The actual career elements are stored
     * in the normalized database.
     */
    public languages: Array<number>;

    public qualification: Array<number>;

    public education: Array<number>;

    public sectors: Array<number>;
}
