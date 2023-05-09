import {PowerHttpClient} from '../../../../clients/PowerHttpClient';
import {AxiosRequestConfig} from 'axios';
import {store} from '../../../reducerIndex';

import {Language} from '../model/Language';
import {Qualification} from '../model/Qualification';
import {IndustrialSector} from '../model/IndustrialSector';
import {SpecialField} from '../model/SpecialField';
import {Career} from '../model/Career';
import {FurtherTraining} from '../model/FurtherTraining';
import {Education} from '../model/Education';
import {ProfileSkill} from '../model/ProfileSkill';
import {Project} from '../model/Project';
import {BaseProfile, newBaseProfile} from '../model/BaseProfile';
import {Profile} from '../model/Profile';

declare const POWER_PROFILE_SERVICE_URL: string;

export class ProfileUpdateServiceClient extends PowerHttpClient {


    private static _instance: ProfileUpdateServiceClient;

    private constructor() {
        super();
    }

    public static instance(): ProfileUpdateServiceClient {
        if (!this._instance) {
            this._instance = new ProfileUpdateServiceClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_PROFILE_SERVICE_URL;
    }


    // ------------------ URLs
    public getFullProfileUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/fullProfile';
    }

    public getBaseProfileUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/baseProfile';
    }

    public getLanguagesUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/language';
    }

    public getQualificationsUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/qualification';
    }

    public getSectorsUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/sector';
    }

    public getSpecialFieldsUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/specialfield';
    }

    public getCareersUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/career';
    }

    public getTrainingsUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/training';
    }

    public getEducationsUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/education';
    }

    public getSkillsUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/skill';
    }

    public getProjectsUrl(initials: string): string {
        return this.base() + '/profile/' + initials + '/project';
    }


    // ---------------------- LOAD

    private credentialsConfig(): AxiosRequestConfig {
        return store.getState().adminReducer.adminAuthConfig();
    }

    public getFullProfile(initials: string): Promise<Profile> {
        const url = this.getFullProfileUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getBaseProfile(initials: string): Promise<BaseProfile> {
        const url = this.getBaseProfileUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getLanguages(initials: string): Promise<Array<Language>> {
        const url = this.getLanguagesUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getQualifications(initials: string): Promise<Array<Qualification>> {
        const url = this.getQualificationsUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getSectors(initials: string): Promise<Array<IndustrialSector>> {
        const url = this.getSectorsUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getSpecialFields(initials: string): Promise<Array<SpecialField>> {
        const url = this.getSpecialFieldsUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getCareers(initials: string): Promise<Array<Career>> {
        const url = this.getCareersUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getTrainings(initials: string): Promise<Array<FurtherTraining>> {
        const url = this.getTrainingsUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getEducation(initials: string): Promise<Array<Education>> {
        const url = this.getEducationsUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getSkills(initials: string): Promise<Array<ProfileSkill>> {
        const url = this.getSkillsUrl(initials);
        this.beginRequest();
        return this.get(url);
    }

    public getProjects(initials: string): Promise<Array<Project>> {
        const url = this.getProjectsUrl(initials);
        this.beginRequest();
        return this.get(url);
    }


    //---------------------------------------------- Profile Entries ---------------------------------------------- //

    public saveDescription(initials: string, description: string): Promise<BaseProfile> {
        const url = this.getBaseProfileUrl(initials);
        this.beginRequest();
        return this.put(url, newBaseProfile(null, description, null));
    }


    public saveLanguage = (initials: string, entry: Language): Promise<Language> => {
        const url = this.getLanguagesUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteLanguage = (initials: string, id: number) => {
        const url = this.getLanguagesUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };


    public saveQualification = (initials: string, entry: Qualification): Promise<Qualification> => {
        const url = this.getQualificationsUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteQualification = (initials: string, id: number) => {
        const url = this.getQualificationsUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };


    public saveSector = (initials: string, entry: IndustrialSector): Promise<IndustrialSector> => {
        const url = this.getSectorsUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteSector = (initials: string, id: number) => {
        const url = this.getSectorsUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };


    public saveSpecialField = (initials: string, entry: SpecialField): Promise<SpecialField> => {
        const url = this.getSpecialFieldsUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteSpecialField = (initials: string, id: number) => {
        const url = this.getSpecialFieldsUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };


    public saveCareer = (initials: string, entry: Career): Promise<Career> => {
        const url = this.getCareersUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteCareer = (initials: string, id: number) => {
        const url = this.getCareersUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };


    public saveTraining = (initials: string, entry: FurtherTraining): Promise<FurtherTraining> => {

        const url = this.getTrainingsUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteTraining = (initials: string, id: number) => {
        const url = this.getTrainingsUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };


    public saveEducation = (initials: string, entry: Education): Promise<Education> => {
        const url = this.getEducationsUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteEducation = (initials: string, id: number) => {
        const url = this.getEducationsUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };

    public saveProfileSkill = (initials: string, entry: ProfileSkill): Promise<ProfileSkill> => {
        const url = this.getSkillsUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteProfileSkill = (initials: string, id: number) => {
        const url = this.getSkillsUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };


    public saveProject = (initials: string, entry: Project): Promise<Project> => {
        const url = this.getProjectsUrl(initials);
        this.beginRequest();
        return this.put(url, entry);
    };
    public deleteProject = (initials: string, id: number) => {
        const url = this.getProjectsUrl(initials) + '/' + id;
        this.beginRequest();
        return this.delete(url);
    };

    // end

}
