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

    public deleteTemplate(id: string) {
        const url = this.base() + '/template/' + id;
        this.beginRequest();
        return this.get(url);
    }

    public getTemplateById(id: string): Promise<Template> {
        const url = this.base() + '/template/' + id;
        this.beginRequest();
        return this.get(url);
    }

    public changeTemplate(id: string) {
        const url = this.base() + '/template/' + id;
        this.beginRequest();
        return this.get(url);
    }

    public getPreview(id: string) {
        const url = this.base() + '/template/preview/' + id;
        this.beginRequest();
        return this.get(url);
    }

    public getPreviewURL(id: string): string {
        return this.base() + '/template/preview/' + id;

    }

    public getAllPreviews(): Promise<Array<string>> {
        const url = this.base() + '/template/preview';
        this.beginRequest();
        return this.get(url);
    }

    public getAllFiles() {
        const url = this.base() + '/file';
        this.beginRequest();
        return this.get(url);
    }
}
