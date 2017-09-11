import {ViewCareer} from './ViewCareer';
import {ViewEducation} from './ViewEducation';
import {ViewKeySkill} from './ViewKeySkill';
import {ViewLanguage} from './ViewLanguage';
import {ViewQualification} from './ViewQualification';
import {ViewSector} from './ViewSector';
import {ViewTraining} from './ViewTraining';
import {ViewProjectRole} from './ViewProjectRole';
import {ViewProject} from './ViewProject';
import {ViewCategory} from './ViewCategory';

export interface ViewProfile {
    id: string;
    owner: string;
    name: string;
    description: string;
    creationDate: Date;
    locale: string;
    careers: Array<ViewCareer>;
    educations: Array<ViewEducation>;
    keySkills: Array<ViewKeySkill>;
    languages: Array<ViewLanguage>;
    qualification: Array<ViewQualification>;
    sectors: Array<ViewSector>;
    trainings: Array<ViewTraining>;
    projectRoles: Array<ViewProjectRole>;
    projects: Array<ViewProject>;
    displayCategories: Array<ViewCategory>;
    rootCategory: ViewCategory;
}