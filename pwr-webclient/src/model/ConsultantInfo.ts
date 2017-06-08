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

    private constructor(initials: string, firstName: string, lastName: string, hasProfile: boolean, title: string) {
        return this.initials(initials).firstName(firstName).lastName(lastName).hasProfile(hasProfile).title(title);
    }

    public static fromAPI(apiConsultant: APIConsultant) {
        return new ConsultantInfo(apiConsultant.initials, apiConsultant.firstName, apiConsultant.lastName,
            !isNullOrUndefined(apiConsultant.profile), apiConsultant.title);
    }

    public getFullName(): string {
        let title = !isNullOrUndefined(this.title()) ? this.title().trim() : "";
        return title + " " + this.firstName() + " " + this.lastName();
    }
}