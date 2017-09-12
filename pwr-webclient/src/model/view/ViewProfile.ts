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

export class ViewProfile {
    id: string;
    owner: string;
    name: string;
    viewDescription: string;
    description: string;
    creationDate: Date;
    locale: string;
    careers: Array<ViewCareer>;
    educations: Array<ViewEducation>;
    keySkills: Array<ViewKeySkill>;
    languages: Array<ViewLanguage>;
    qualifications: Array<ViewQualification>;
    sectors: Array<ViewSector>;
    trainings: Array<ViewTraining>;
    projectRoles: Array<ViewProjectRole>;
    projects: Array<ViewProject>;
    displayCategories: Array<ViewCategory>;
    rootCategory: ViewCategory;

    constructor(viewProfile: ViewProfile) {
        this.id = viewProfile.id;
        this.owner = viewProfile.owner;
        this.name = viewProfile.name;
        this.viewDescription = viewProfile.viewDescription;
        this.description = viewProfile.description;
        this.creationDate = new Date(viewProfile.creationDate);
        this.locale = viewProfile.locale;
        this.careers = viewProfile.careers;
        this.educations = viewProfile.educations;
        this.keySkills = viewProfile.keySkills;
        this.languages = viewProfile.languages;
        this.qualifications = viewProfile.qualifications;
        this.sectors = viewProfile.sectors;
        this.trainings = viewProfile.trainings;
        this.projectRoles = viewProfile.projectRoles;
        this.projects = viewProfile.projects;
        this.displayCategories = viewProfile.displayCategories;
        this.rootCategory = viewProfile.rootCategory;
    }
}