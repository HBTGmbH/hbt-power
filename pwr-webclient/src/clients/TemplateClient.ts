import {PowerHttpClient} from './PowerHttpClient';
import {AxiosRequestConfig} from 'axios';
import {Template} from '../model/view/Template';

declare const POWER_VIEW_PROFILE_SERVICE_URL: string;

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
        return POWER_VIEW_PROFILE_SERVICE_URL;
    }

    public getAllTemplates(): Promise<Array<string>> {
        const url = this.base() + '/template/';
        this.beginRequest();
        return this.get(url);
    }

    public uploadAsTemplate(formData: any, config: AxiosRequestConfig): Promise<Template> {
        const url = this.base() + '/template/';
        this.beginRequest();
        return this.post(url, formData, config);
    }

    /**
     * Deletes the template and its BIRT file
     */
    public deleteTemplate(id: string) {
        const url = this.base() + '/template/' + id;
        this.beginRequest();
        return this.delete(url);
    }

    public getTemplateById(id: string): Promise<Template> {
        const url = this.base() + '/template/' + id;
        this.beginRequest();
        return this.get(url);
    }

    /**
     * Saves name, description and creator. The file ids are left out on purpose: the service keeps the stored ones
     * for every empty field (ReportTemplateController.updateTemplate)
     */
    public changeTemplate(template: Template) {
        const url = this.base() + '/template/' + template.id;
        this.beginRequest();
        return this.post(url, {name: template.name, description: template.description, createUser: template.createUser});
    }

    public getAllFiles() {
        const url = this.base() + '/file';
        this.beginRequest();
        return this.get(url);
    }
}
