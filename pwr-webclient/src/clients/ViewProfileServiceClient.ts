import {PowerHttpClient} from './PowerHttpClient';
import {HousekeepingFindings} from '../model/admin/HousekeepingFindings';
import {SortableEntryField, SortableEntryType} from '../model/view/NameComparableType';
import {AxiosRequestConfig} from 'axios';
import {ViewProfile} from '../model/view/ViewProfile';
import {DisplayCategoryTarget} from '../model/view/DisplayCategoryTarget';
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


    /**
     * In the path of the view profile, as the service checks the consultant in the path (#255)
     */
    public getParentCategories(initials: string, viewProfileId: string, skillName: string): Promise<Map<number, ViewCategory>> {
        const url = this.base() + '/' + encodeURIComponent(initials) + '/view/' + encodeURIComponent(viewProfileId)
            + '/parent/' + encodeURIComponent(skillName);
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

    /** Where the skills of a display category can move to, with the number that fit (#171) */
    public getMoveTargets(initials: string, id: string, displayCategoryIndex: number): Promise<Array<DisplayCategoryTarget>> {
        const url = this.patchBase(initials, id) + 'DISPLAY_CATEGORY/' + displayCategoryIndex + '/targets';
        this.beginRequest();
        return this.get(url);
    }

    /** Moves the skills of a display category that fit into the target category (#171) */
    public patchMoveAllSkills(initials: string, id: string, displayCategoryIndex: number, targetId: number): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'DISPLAY_CATEGORY/' + displayCategoryIndex + '/move';
        return this.patchInBackground(url, null, {params: {'target-id': targetId}});
    }

    /** Language of the skill and category names (#174), null for the names of the skill tree */
    public patchLocalization(initials: string, id: string, language: string | null): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'localization';
        return this.patchInBackground(url, null, {params: language ? {language: language} : {}});
    }

    /** Versions of all skills on or off (#151); the choice per version stays */
    public patchShowSkillVersions(initials: string, id: string, show: boolean): Promise<ViewProfile> {
        const url = this.patchBase(initials, id) + 'SKILL/versions/' + show;
        return this.patchInBackground(url);
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

    /**
     * Name and note of the view profile (#179), always both: the service reads a missing text as empty and stores it
     */
    public patchInfo(initials: string, viewProfileId: string, name: string, viewDescription: string): Promise<ViewProfile> {
        const url = this.base() + '/view/' + initials + '/view/' + viewProfileId + '/info';
        return this.patchInBackground(url, {name, viewDescription});
    }

    public patchDescription(initials: string, viewProfileId: string, description: string, config: AxiosRequestConfig): Promise<ViewProfile> {
        const url = this.patchBase(initials, viewProfileId) + 'DESCRIPTION';
        return this.patchInBackground(url, description, config);
    }

    /**
     * The housekeeping checks of the service (#242), without loading spinner and error alert: the housekeeping page
     * shows a service that does not answer next to the others
     */
    public getHousekeeping = (): Promise<Array<HousekeepingFindings>> => {
        return this.getQuietly(this.base() + '/admin/housekeeping');
    };

    /** Housekeeping, rubric old (#289): data older than the limit of the service, the newest of each consultant excepted */
    public getOldHousekeeping = (): Promise<Array<HousekeepingFindings>> => {
        return this.getQuietly(this.base() + '/admin/housekeeping/old');
    };

    /** Deletes what the check of old data finds now; the answer says how many */
    public cleanOldHousekeeping = (check: string): Promise<HousekeepingFindings> => {
        const url = this.base() + '/admin/housekeeping/old/' + encodeURIComponent(check);
        this.beginRequest();
        return this.delete(url);
    };

    /** Deletes what the check finds now; the answer says how many */
    public cleanHousekeeping = (check: string): Promise<HousekeepingFindings> => {
        const url = this.base() + '/admin/housekeeping/' + encodeURIComponent(check);
        this.beginRequest();
        return this.delete(url);
    };
}
