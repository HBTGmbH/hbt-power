import {doop} from 'doop';
import {APIConsultant} from './APIProfile';
import has = Reflect.has;
import {isNullOrUndefined} from 'util';
@doop
export class ConsultantInfo {

    @doop
    public get initials() {return doop<string, this>()};
    @doop
    public get firstName() {return doop<string, this>()};
    @doop
    public get lastName() {return doop<string, this>()};
    @doop
    public get hasProfile() {return doop<boolean, this>()};
    @doop
    public get title() {return doop<string, this>()};
    @doop
    public get birthDate() {return doop<Date, this>()};

    private constructor(initials: string, firstName: string, lastName: string, hasProfile: boolean, title: string, birthDate: Date) {
        return this.initials(initials).firstName(firstName).lastName(lastName).hasProfile(hasProfile).title(title).birthDate(birthDate);
    }

    public static fromAPI(apiConsultant: APIConsultant) {
        return new ConsultantInfo(apiConsultant.initials, apiConsultant.firstName, apiConsultant.lastName,
            !isNullOrUndefined(apiConsultant.profile), apiConsultant.title, new Date(apiConsultant.birthDate));
    }

    public static empty() {
        return new ConsultantInfo("", "", "", false, null, null);
    }

    /**
     * Returns the full name of the consultant, including their title.
     * (<Title>) <FirstName> <LastName>
     * @returns {string}
     */
    public getFullName(): string {
        let title = !isNullOrUndefined(this.title()) ? this.title().trim() + " " : "";

        return title + this.firstName() + " " + this.lastName();
    }
}