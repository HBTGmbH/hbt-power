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