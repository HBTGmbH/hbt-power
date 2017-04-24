import {CareerElement} from './CareerElement';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {EducationEntry} from './EducationEntry';
import {Sector} from './Sector';


export class NormalizedProfile {
    public id: number;
    public description: string;
    public currentPosition: string;
    /**
     * The career elements, referenced by ID. The actual career elements are stored
     * in the normalized databaseReducer.
     */
    public career: Array<number>;
    /**
     * The languages, referenced by ID. The actual career elements are stored
     * in the normalized databaseReducer.
     */
    public languages: Array<number>;

    public qualification: Array<number>;

    public education: Array<number>;

    public sectors: Array<number>;
}
