import {PowerHttpClient} from './PowerHttpClient';
import {SortableEntryField, SortableEntryType} from '../model/view/NameComparableType';
import {AxiosRequestConfig} from 'axios';
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

    /*
    
    public getConsultant = (initials: string): Promise<APIConsultant> => {
        const url = this.base() + '/consultants/' + initials;
        this.beginRequest();
        return this.get(url);
    };
     */


    public getParentCategories(skillName: string): Promise<Map<number, ViewCategory>> {
        const url = this.base() + '/tst/view/0/parent/' + skillName;
        this.beginRequest();
        return this.get(url);
    }

    public createChangedViewProfile(initials: string, oldId: string, body: any): Promise<ViewProfile> {
        const url = this.base() + '/view/update/' + initials + '/' + oldId;
        this.beginRequest();
        return this.post(url, body);
    }

    public getViewProfile(initials: string, id: string): Promise<ViewProfile> {
        const url = this.base() + '/view/' + initials + '/' + id;
        this.beginRequest();
        return this.get(url);
    }

    public getViewProfileIds(initials: string): Promise<Array<string>> {
        const url = this.base() + '/view/' + initials;
        this.beginRequest();
        return this.get(url);
    }

    public postViewProfile(initials: string, body: any): Promise<ViewProfile> {
        const url = this.base() + '/view/' + initials;
        this.beginRequest();
        return this.post(url, body);
    }

    public deleteViewProfile(initials: string, id: string) { // result ignored
        const url = this.base() + '/view/' + initials + '/' + id;
        this.beginRequest();
        return this.delete(url);
    }

    private patchBase(initials: string, id: string) {
        return this.base() + '/' + initials + '/view/' + id + '/';
    }

    // Editing a view profile (move, show/hide, sort, display category, description): without the loading overlay
    public patchMoveEntry(initials: string, id: string, movableEntry: string, sourceIndex: number, targetIndex: number): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + movableEntry + '/position/' + sourceIndex + '/' + targetIndex;
        return this.patchInBackground(url);
    }

    public patchMoveNestedEntry(initials: string, id: string, container: string, containerIndex: number, movableEntry: string, sourceIndex: number, targetIndex: number): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + container + '/' + containerIndex + '/' + movableEntry + '/position/' + sourceIndex + '/' + targetIndex;
        return this.patchInBackground(url);
    }

    public patchToggleEntry(initials: string, id: string, toggleableEntry: string, index: number, isEnabled: boolean): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + toggleableEntry + '/' + index + '/visibility/' + isEnabled;
        return this.patchInBackground(url);
    }

    public patchToggleNestedEntry(initials: string, id: string, container: string, containerIndex: number, toggleableEntry: string, index: number, isEnabled: boolean): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + container + '/' + containerIndex + '/' + toggleableEntry + '/' + index + '/visibility/' + isEnabled;
        return this.patchInBackground(url);
    }

    public patchSortEntry(initials: string, id: string, entryType: SortableEntryType, field: SortableEntryField, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + SortableEntryType[entryType] + '/' + field + '/order';
        return this.patchInBackground(url, null, config);
    }

    public patchToggleSkill(initials: string, id: string, isEnabled: boolean, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'SKILL/visibility/' + isEnabled;
        return this.patchInBackground(url, null, config);
    }

    public patchSetDisplayCategory(initials: string, id: string, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'SKILL/display-category';
        return this.patchInBackground(url, null, config);
    }

    public patchSortNestedEntry(initials: string, id: string, container: string, containerIndex: number,
                                entryType: SortableEntryType, field: SortableEntryField, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + container + '/' + containerIndex + '/' + SortableEntryType[entryType] + '/' + field + '/order';
        return this.patchInBackground(url, null, config);
    }

    public patchToggleVersion(initials: string, id: string, skillName: string, versionName: string, isEnabled: boolean, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'SKILL/visibility/version/' + isEnabled;
        return this.patchInBackground(url, null, config);
    }

    public postReport(initials: string, viewProfileId: string, templateId: string) { // result ignored
        const url = this.base() + '/view/' + initials + '/view/' + viewProfileId + '/' + templateId + '/report';
        this.beginRequest();
        return this.post(url);
    }

    /**
     * The report as PDF with the data of the view profile, rendered live and not stored. Loaded with the token, so it
     * can be shown through a blob URL; an iframe pointing at the API would not send the token.
     * Rejects with status 422, without an error alert, if the template cannot be rendered with this data.
     */
    public getReportPreview(initials: string, viewProfileId: string, templateId: string): Promise<Blob> {
        const url = this.base() + '/view/' + initials + '/view/' + viewProfileId + '/' + templateId + '/preview';
        this.beginRequest();
        return this.getExpecting<Blob>(url, [422], {responseType: 'blob'})
            .then(blob => new Blob([blob], {type: 'application/pdf'}));
    }

    public patchPartialUpdate(initials: string, viewProfileId: string, body: any): Promise<ViewProfile> {
        const url = this.base() + '/view/' + initials + '/view/' + viewProfileId + '/info';
        this.beginRequest();
        return this.patch(url, body);
    }

    public patchDescription(initials: string, viewProfileId: string, description: string, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, viewProfileId) + 'DESCRIPTION';
        return this.patchInBackground(url, description, config);
    }


}
