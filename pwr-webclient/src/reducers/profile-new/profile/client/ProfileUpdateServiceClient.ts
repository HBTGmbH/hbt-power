import {PowerHttpClient} from '../../../../clients/PowerHttpClient';
import axios, {AxiosRequestConfig} from 'axios';
import {store} from '../../../reducerIndex';
import {Promise} from 'es6-promise';
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


    private credentialsConfig(): AxiosRequestConfig {
        return store.getState().adminReducer.adminAuthConfig();
    }

    public getBaseProfile(initials: string): Promise<BaseProfile> {
        const url = this.base() + '/profile/' + initials + '/baseProfile/';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public saveDescription(initials: string, description: string): Promise<BaseProfile> {
        const url = this.base() + '/profile/' + initials + '/baseProfile';
        this.beginRequest();
        return this.preProcess(axios.put(url, newBaseProfile(null, description, null)));
    }

    public getLanguages(initials: string): Promise<Array<Language>> {
        const url = this.base() + '/profile/' + initials + '/language';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getQualifications(initials: string): Promise<Array<Qualification>> {
        const url = this.base() + '/profile/' + initials + '/qualification';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getSectors(initials: string): Promise<Array<IndustrialSector>> {
        const url = this.base() + '/profile/' + initials + '/sector';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getSpecialFields(initials: string): Promise<Array<SpecialField>> {
        const url = this.base() + '/profile/' + initials + '/keyskill'; // TODO im backend neuen namen anpassen?
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getCareers(initials: string): Promise<Array<Career>> {
        const url = this.base() + '/profile/' + initials + '/career';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getTrainings(initials: string): Promise<Array<FurtherTraining>> {
        const url = this.base() + '/profile/' + initials + '/training';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getEducation(initials: string): Promise<Array<Education>> {
        const url = this.base() + '/profile/' + initials + '/education';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getSkills(initials: string): Promise<Array<ProfileSkill>> {
        const url = this.base() + '/profile/' + initials + '/skill';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }

    public getProjects(initials: string): Promise<Array<Project>> {
        const url = this.base() + '/profile/' + initials + '/project';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    }


    //---------------------------------------------- Profile Entries ---------------------------------------------- //

    public saveLanguage = (initials: string, entry: Language): Promise<Language> => {
        const url = this.base() + '/profile/' + initials + '/language';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteLanguage = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/language/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveQualification = (initials: string, entry: Qualification): Promise<Qualification> => {
        const url = this.base() + '/profile/' + initials + '/qualification';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteQualification = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/qualification/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveSector = (initials: string, entry: IndustrialSector): Promise<IndustrialSector> => {
        const url = this.base() + '/profile/' + initials + '/sector';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteSector = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/sector/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveKeySkill = (initials: string, entry: SpecialField): Promise<SpecialField> => {
        const url = this.base() + '/profile/' + initials + '/keyskill';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteKeySkill = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/keyskill/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveCareer = (initials: string, entry: Career): Promise<Career> => {
        const url = this.base() + '/profile/' + initials + '/career';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteCareer = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/career/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveTraining = (initials: string, entry: FurtherTraining): Promise<FurtherTraining> => {
        const url = this.base() + '/profile/' + initials + '/training';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteTraining = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/training/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveEducation = (initials: string, entry: Education): Promise<Education> => {
        const url = this.base() + '/profile/' + initials + '/education';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteEducation = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/education/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveProfileSkill = (initials: string, entry: ProfileSkill): Promise<ProfileSkill> => {
        const url = this.base() + '/profile/' + initials + '/skill';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteProfileSkill = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/skill/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };


    public saveProject = (initials: string, entry: Project): Promise<Project> => {
        const url = this.base() + '/profile/' + initials + '/project';
        this.beginRequest();
        return this.preProcess(axios.put(url, entry));
    };
    public deleteProject = (initials: string, id: number) => {
        const url = this.base() + '/profile/' + initials + '/project/' + id;
        this.beginRequest();
        return this.preProcess(axios.delete(url));
    };

    // end


}