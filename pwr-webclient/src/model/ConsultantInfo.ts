import {doop} from 'doop';
import {APIConsultant} from './APIProfile';
@doop
export class ConsultantInfo {

    @doop
    public get initials() {return doop<string, this>()};
    @doop
    public get firstName() {return doop<string, this>()};
    @doop
    public get lastName() {return doop<string, this>()};

    private constructor(initials: string, firstName: string, lastName: string) {
        return this.initials(initials).firstName(firstName).lastName(lastName);
    }

    public static fromAPI(apiConsultant: APIConsultant) {
        return new ConsultantInfo(apiConsultant.initials, apiConsultant.firstName, apiConsultant.lastName);
    }

    public getFullName(): string {
        return this.firstName() + this.lastName();
    }
}