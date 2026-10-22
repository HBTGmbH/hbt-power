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
import {ViewProfileInfo} from './ViewProfileInfo';

/**
 * Note: Can be mutable because view profiles are never partially edited in the client
 * They are always complete replaced by the value the API returns -> immutability would be
 * unnecessary overhead
 */
export class ViewProfile {
    id: string;
    viewProfileInfo: ViewProfileInfo;
    locale: string;
    description: string;
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
    /** Versions of the skills on the page and in the export (#151) */
    showSkillVersions: boolean;
    /** ISO 639-2 code of the language of the skill and category names (#174), null for the names of the skill tree */
    localization: string | null;

    private skillDisplayCategories: Map<string, ViewCategory>;

    constructor(viewProfile: ViewProfile) {
        this.id = viewProfile.id;
        this.description = viewProfile.description;
        this.viewProfileInfo = new ViewProfileInfo(viewProfile.viewProfileInfo);
        this.locale = viewProfile.locale;
        this.careers = viewProfile.careers.map(ViewCareer.of);
        this.educations = viewProfile.educations.map(ViewEducation.of);
        this.keySkills = viewProfile.keySkills;
        this.languages = viewProfile.languages;
        this.qualifications = viewProfile.qualifications.map(ViewQualification.of);
        this.sectors = viewProfile.sectors;
        this.trainings = viewProfile.trainings.map(ViewTraining.of);
        this.projectRoles = viewProfile.projectRoles;
        this.projects = viewProfile.projects.map(ViewProject.of);
        this.displayCategories = viewProfile.displayCategories;
        // Missing in view profiles from before #151: shown, as they were
        this.showSkillVersions = viewProfile.showSkillVersions !== false;
        this.localization = viewProfile.localization || null;

        this.skillDisplayCategories = new Map();
        this.gatherParents();
    }

    private gatherParents() {
        this.displayCategories.forEach(cat => {
            cat.displaySkills.forEach(skill => {
                this.skillDisplayCategories.set(skill.name, cat);
            });
        });
    }

    public getDisplayForSkill(skillName: string): ViewCategory {
        return this.skillDisplayCategories.get(skillName);
    }

}