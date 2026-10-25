import {APIConsultant} from '../model/APIProfile';
import {HousekeepingFindings} from '../model/admin/HousekeepingFindings';
import {PowerHttpClient} from './PowerHttpClient';
import {ConsultantInfoDTO} from '../model/ConsultantInfoDTO';
import {ConsultantName} from '../model/ConsultantName';
import {ProfileCheck, ProfileCheckSummary, ProfileConfirmation} from '../model/check/ProfileCheck';
import {NameEntity} from '../reducers/profile-new/profile/model/NameEntity';
import {NameEntityLocalization} from '../model/NameEntityLocalization';

declare const POWER_PROFILE_SERVICE_URL: string;

/**
 * Singleton for configuration purposes? I don't know, doesn't matter for now. Maybe if the whole URL-Configuration
 * is being reworked, this will make sense.
 */
export class ProfileServiceClient extends PowerHttpClient {


    private static _instance: ProfileServiceClient;

    private constructor() {
        super();
    }

    public static instance(): ProfileServiceClient {
        if (!this._instance) {
            this._instance = new ProfileServiceClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_PROFILE_SERVICE_URL;
    }

    public getConsultant = (initials: string): Promise<APIConsultant> => {
        const url = this.base() + '/consultants/' + initials;
        return this.get(url);
    };

    // Listing and managing the consultants is under /admin (#218)
    public getConsultants = (): Promise<Array<APIConsultant>> => {
        const url = this.base() + '/admin/consultants';
        return this.get(url);
    };

    /**
     * Short and full names of all consultants (#216); quietly, without them the app shows the full names
     */
    public getConsultantNames = (): Promise<Array<ConsultantName>> => {
        return this.getQuietly(this.base() + '/consultants/names');
    };

    public createConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        const url = this.base() + '/admin/consultants';
        return this.post(url, consultant);
    };

    public updateConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        const url = this.base() + '/admin/consultants/' + consultant.initials;
        return this.patch(url, consultant);
    };

    public getSkillSuggestions = (): Promise<Array<String>> => {
        const url = this.base() + '/suggestions/skills';
        return this.get(url);
    };

    /**
     * Merges skill source into skill target in all profiles, projects and the skill tree. 400, 404 and 409 reject with
     * a {@link PowerApiError} without an error alert, the caller explains them
     */
    public mergeSkill = (source: string, target: string, version?: string): Promise<void> => {
        const url = this.base() + '/admin/skills/merge';
        const params: any = {source, target};
        if (version && version.trim().length > 0) {
            params.version = version.trim();
        }
        return this.postExpecting(url, [400, 404, 409], null, {params});
    };

    /** Renames a skill of the skill tree, in the tree and in all profiles (#228); the old name becomes an alias */
    public renameSkill = (name: string, newName: string): Promise<void> => {
        const url = this.base() + '/admin/skills/rename';
        return this.post(url, null, {params: {name, newName}});
    };

    /** Deletes a skill from all profiles and projects and from the skill tree (#229) */
    public deleteSkillEverywhere = (name: string): Promise<void> => {
        const url = this.base() + '/admin/skills';
        return this.delete(url, {params: {name}});
    };

    // Profile elements in all profiles (#227)

    /**
     * How many consultants use each element of the type, by id, for the list of the admin area (#271); quietly: without
     * the numbers the list still works
     */
    public getNameEntityUsage = (type: string): Promise<Record<string, number>> => {
        return this.getQuietly(this.base() + '/admin/name-entities/usage', {params: {type}});
    };

    /**
     * How many consultants use each skill, by the name of the skill tree, for the list of the admin area (#271); quietly
     */
    public getSkillUsage = (): Promise<Record<string, number>> => {
        return this.getQuietly(this.base() + '/admin/skills/usage');
    };

    /** The initials of the consultants whose profile uses the element, counted in the database */
    public getNameEntityUsers = (id: number): Promise<Array<string>> => {
        const url = this.base() + '/admin/name-entities/' + id + '/users';
        return this.get(url);
    };

    public renameNameEntity = (id: number, name: string): Promise<NameEntity> => {
        const url = this.base() + '/admin/name-entities/' + id;
        return this.patch(url, null, {params: {name}});
    };

    public mergeNameEntity = (id: number, targetId: number): Promise<NameEntity> => {
        const url = this.base() + '/admin/name-entities/' + id + '/merge';
        return this.post(url, null, {params: {target: targetId}});
    };

    public deleteNameEntity = (id: number): Promise<void> => {
        const url = this.base() + '/admin/name-entities/' + id;
        return this.delete(url);
    };

    /** Adds an alias (#270); 400 for a blank one, 409 if it is the name or an alias of another element of the type */
    public addNameEntityAlias = (id: number, alias: string): Promise<Array<string>> => {
        const url = this.base() + '/admin/name-entities/' + id + '/aliases';
        return this.postExpecting(url, [400, 409], null, {params: {alias}});
    };

    public deleteNameEntityAlias = (id: number, alias: string): Promise<Array<string>> => {
        const url = this.base() + '/admin/name-entities/' + id + '/aliases';
        return this.delete(url, {params: {alias}});
    };

    /** The names of the element in other languages (#291) */
    public getNameEntityLocalizations = (id: number): Promise<Array<NameEntityLocalization>> => {
        const url = this.base() + '/admin/name-entities/' + id + '/localizations';
        return this.get(url);
    };

    /** Sets the name in the language, replacing the one there was; the localizations afterwards */
    public setNameEntityLocalization = (id: number, language: string, qualifier: string): Promise<Array<NameEntityLocalization>> => {
        const url = this.base() + '/admin/name-entities/' + id + '/localizations/' + encodeURIComponent(language);
        return this.put(url, null, {params: {qualifier}});
    };

    public deleteNameEntityLocalization = (id: number, language: string): Promise<Array<NameEntityLocalization>> => {
        const url = this.base() + '/admin/name-entities/' + id + '/localizations/' + encodeURIComponent(language);
        return this.delete(url);
    };

    public getUnusedNameEntities = (type: string): Promise<Array<NameEntity>> => {
        const url = this.base() + '/admin/name-entities/unused';
        return this.get(url, {params: {type}});
    };

    public deleteUnusedNameEntities = (type: string): Promise<Array<NameEntity>> => {
        const url = this.base() + '/admin/name-entities/unused';
        return this.delete(url, {params: {type}});
    };

    public authenticateAdmin = (): Promise<void> => {
        const url = this.base() + '/admin/';
        return this.head(url);
    };

    public deleteConsultant = (initials: string): Promise<void> => {
        const url = this.base() + `/admin/consultants/${initials}`;
        return this.delete(url);
    };

    public getAllConsultantInfos = (): Promise<ConsultantInfoDTO[]> => {
        const url = this.base() + `/admin/consultants/info`;
        return this.get(url);
    };

    public uploadProfilePicture = (picture: File): Promise<string> => {
        const url = this.base() + `/admin/profile-pictures`;
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        const formData = new FormData();
        formData.append("file", picture);
        return this.post<{id: string}>(url, formData, config)
            .then(response => response.id)
    }

    public deleteProfilePicture = (id: string): Promise<void> => {
        const url = this.base() + `/admin/profile-pictures/${id}`;
        return this.delete(url);
    }

    /**
     * A profile picture, null if there is none. Loaded with the token, so it can be shown through a blob URL; an img
     * pointing at the API would not send the token. Use PwrProfilePicture, which also caches the pictures.
     */
    public getProfilePicture = (profilePictureId: string): Promise<Blob | null> => {
        const url = this.base() + `/profile-pictures/${profilePictureId}`;
        return this.getOrNull<Blob>(url, {responseType: 'blob'})
            .then(blob => blob && blob.size > 0 ? blob : null);
    }

    // ------------------------------------------------------------------------------------- profile check (#139)

    /**
     * In the background, without alert: the card stays away if the check fails
     */
    public getProfileCheck = (initials: string): Promise<ProfileCheck> => {
        return this.getQuietly(this.base() + '/profile/' + encodeURIComponent(initials) + '/check');
    };

    /**
     * "My profile is up to date"; the edge service adds who confirmed
     */
    public confirmProfile = (initials: string): Promise<ProfileCheck> => {
        return this.post(this.base() + '/profile/' + encodeURIComponent(initials) + '/check/confirmation');
    };

    /** Admins only (edge: /admin/**) */
    public getProfileCheckSummaries = (): Promise<Array<ProfileCheckSummary>> => {
        return this.getQuietly(this.base() + '/admin/profile-checks');
    };

    /** Admins only (edge: /admin/**) */
    public getProfileConfirmations = (initials: string): Promise<Array<ProfileConfirmation>> => {
        return this.getQuietly(this.base() + '/admin/profile-checks/' + encodeURIComponent(initials) + '/confirmations');
    };

    /**
     * The housekeeping checks of the service (#242), without error alert: the housekeeping page
     * shows a service that does not answer next to the others
     */
    public getHousekeeping = (): Promise<Array<HousekeepingFindings>> => {
        return this.getQuietly(this.base() + '/admin/housekeeping');
    };

    /**
     * Rubric unused (#288): the profile elements no profile uses, per type (check `unused-name-entities-<TYPE>`);
     * deleting goes through `deleteUnusedNameEntities`
     */
    public getUnusedHousekeeping = (): Promise<Array<HousekeepingFindings>> => {
        return this.getQuietly(this.base() + '/admin/housekeeping/unused');
    };

    /** Deletes what the check finds now; the answer says how many */
    public cleanHousekeeping = (check: string): Promise<HousekeepingFindings> => {
        const url = this.base() + '/admin/housekeeping/' + encodeURIComponent(check);
        return this.delete(url);
    };
}
