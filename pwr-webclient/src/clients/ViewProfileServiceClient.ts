import {PowerHttpClient} from './PowerHttpClient';
import {SortableEntryField, SortableEntryType} from '../model/view/NameComparableType';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {ViewProfile} from '../model/view/ViewProfile';
import {ViewCategory} from '../model/view/ViewCategory';

declare const POWER_VIEW_PROFILE_SERVICE_URL;

export class ViewProfileServiceClient extends PowerHttpClient {

    private static _instance: ViewProfileServiceClient;

    private constructor() {
        super();
    }

    public static instance(): ViewProfileServiceClient {
        if (!this._instance) {
            this._instance = new ViewProfileServiceClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_VIEW_PROFILE_SERVICE_URL;
    }

    public getBuildInfoURL() {
        return this.base() + '/actuator/info';
    }

    /*
    
    public getConsultant = (initials: string): Promise<APIConsultant> => {
        const url = this.base() + '/consultants/' + initials;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    };
     */


    public getParentCategories(skillName: string): Promise<Map<number, ViewCategory>> {
        const url = this.base() + '/tst/view/0/parent/' + skillName;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public createChangedViewProfile(initials: string, oldId: string, body: any): Promise<ViewProfile> {
        const url = this.base() + '/view/update/' + initials + '/' + oldId;
        this.beginRequest();
        return this.executeRequest(axios.post(url, body));
    }

    public getViewProfile(initials: string, id: string): Promise<ViewProfile> {
        const url = this.base() + '/view/' + initials + '/' + id;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public getViewProfileIds(initials: string): Promise<Array<string>> {
        const url = this.base() + '/view/' + initials;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    }

    public postViewProfile(initials: string, body: any): Promise<ViewProfile> {
        const url = this.base() + '/view/' + initials;
        this.beginRequest();
        return this.executeRequest(axios.post(url, body));
    }

    public deleteViewProfile(initials: string, id: string) { // result ignored
        const url = this.base() + '/view/' + initials + '/' + id;
        this.beginRequest();
        return this.executeRequest(axios.delete(url));
    }

    private patchBase(initials: string, id: string) {
        return this.base() + '/' + initials + '/view/' + id + '/';
    }

    public patchMoveEntry(initials: string, id: string, movableEntry: string, sourceIndex: number, targetIndex: number): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + movableEntry + '/position/' + sourceIndex + '/' + targetIndex;
        this.beginRequest();
        return this.executeRequest(axios.patch(url));
    }

    public patchMoveNestedEntry(initials: string, id: string, container: string, containerIndex: number, movableEntry: string, sourceIndex: number, targetIndex: number): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + container + '/' + containerIndex + '/' + movableEntry + '/position/' + sourceIndex + '/' + targetIndex;
        this.beginRequest();
        return this.executeRequest(axios.patch(url));
    }

    public patchToggleEntry(initials: string, id: string, toggleableEntry: string, index: number, isEnabled: boolean): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + toggleableEntry + '/' + index + '/visibility/' + isEnabled;
        this.beginRequest();
        return this.executeRequest(axios.patch(url));
    }

    public patchToggleNestedEntry(initials: string, id: string, container: string, containerIndex: number, toggleableEntry: string, index: number, isEnabled: boolean): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + container + '/' + containerIndex + '/' + toggleableEntry + '/' + index + '/visibility/' + isEnabled;
        this.beginRequest();
        return this.executeRequest(axios.patch(url));
    }

    public patchSortEntry(initials: string, id: string, entryType: SortableEntryType, field: SortableEntryField, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + SortableEntryType[entryType] + '/' + field + '/order';
        this.beginRequest();
        return this.executeRequest(axios.patch(url, null, config));
    }

    public patchToggleSkill(initials: string, id: string, isEnabled: boolean, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'SKILL/visibility/' + isEnabled;
        this.beginRequest();
        return this.executeRequest(axios.patch(url, null, config));
    }

    public patchSetDisplayCategory(initials: string, id: string, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'SKILL/display-category';
        this.beginRequest();
        return this.executeRequest(axios.patch(url, null, config));
    }

    public patchSortNestedEntry(initials: string, id: string, container: string, containerIndex: number,
                                entryType: SortableEntryType, field: SortableEntryField, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + container + '/' + containerIndex + '/' + SortableEntryType[entryType] + '/' + field + '/order';
        this.beginRequest();
        return this.executeRequest(axios.patch(url, null, config));
    }

    public patchToggleVersion(initials: string, id: string, skillName: string, versionName: string, isEnabled: boolean, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'SKILL/visibility/version/' + isEnabled;
        this.beginRequest();
        return this.executeRequest(axios.patch(url, null, config));
    }

    public postReport(initials: string, viewProfileId: string, templateId: string) { // result ignored
        const url = this.base() + '/view/' + initials + '/view/' + viewProfileId + '/' + templateId + '/report';
        this.beginRequest();
        return this.executeRequest(axios.post(url));
    }

    public patchPartialUpdate(initials: string, viewProfileId: string, body: any): Promise<ViewProfile> {
        const url = this.base() + '/view/' + initials + '/view/' + viewProfileId + '/info';
        this.beginRequest();
        return this.executeRequest(axios.patch(url, body));
    }

    public patchDescription(initials: string, viewProfileId: string, description: string, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, viewProfileId) + 'DESCRIPTION';
        this.beginRequest();
        return this.executeRequest(axios.patch(url, description, config));
    }


}
