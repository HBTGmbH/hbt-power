import {PowerHttpClient} from './PowerHttpClient';
import axios, {AxiosRequestConfig} from 'axios';
import {Template} from '../model/view/Template';

declare const POWER_API_HOST_VIEW;
declare const POWER_API_PORT_VIEW;
declare const POWER_API_SUFFIX_VIEW;

export class TemplateClient extends PowerHttpClient {

    private static _instance: TemplateClient;

    private constructor() {
        super();
    }

    public static instance(): TemplateClient {
        if (!this._instance) {
            this._instance = new TemplateClient();
        }
        return this._instance;
    }

    private base() {
        return POWER_API_HOST_VIEW + ':' + POWER_API_PORT_VIEW + POWER_API_SUFFIX_VIEW;
    }

    public getAllTemplates(): Promise<Array<string>> {
        const url = this.base() + '/template/';
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public uploadAsTemplate(formData:any, config: AxiosRequestConfig): Promise<Template> {
        const url = this.base() + '/template/';
        this.beginRequest();
        return this.executeRequest(axios.post(url, formData, config));
    }

    public deleteTemplate(id: string) {
        const url = this.base() + '/template/' + id;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getTemplateById(id: string): Promise<Template> {
        const url = this.base() + '/template' + '/' + id;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public changeTemplate(id: string, template: Template) {
        const url = this.base() + '/template' + '/' + id;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getPreview(id: string): Promise {
        const url = this.base() + '/template' + '/preview' + '/' + id;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getAllPreviews(): Promise<Array<string>> {
        const url = this.base() + '/template' + '/preview';
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getAllFiles() {
        const url = this.base() + '/file';
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }


    private baseReport() {
        return POWER_API_HOST_REPORT + ':' + POWER_API_PORT_REPORT + POWER_API_SUFFIX_REPORT;
    }

    public getFileById(id: string): Promise {
        const url = this.baseReport() + '/file/' + id;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

}
