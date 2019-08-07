import {doop} from 'doop';
import {APIConsultant} from './APIProfile';
import {isNullOrUndefined} from 'util';

@doop
export class ConsultantInfo {

    @doop
    public get initials() {
        return doop<string, this>();
    };

    @doop
    public get firstName() {
        return doop<string, this>();
    };

    @doop
    public get lastName() {
        return doop<string, this>();
    };


    @doop
    public get title() {
        return doop<string, this>();
    };

    @doop
    public get birthDate() {
        return doop<Date, this>();
    };

    @doop
    public get active() {
        return doop<boolean, this>();
    };


    private constructor(initials: string, firstName: string, lastName: string, title: string,
                        birthDate: Date, active: boolean) {
        return this.initials(initials).firstName(firstName).lastName(lastName).title(title)
            .birthDate(birthDate).active(active);
    }

    public static fromAPI(apiConsultant: APIConsultant) {
        return new ConsultantInfo(apiConsultant.initials, apiConsultant.firstName, apiConsultant.lastName,
            apiConsultant.title, new Date(apiConsultant.birthDate), apiConsultant.active);
    }

    public toAPI(): APIConsultant {
        return {
            active: this.active(),
            initials: this.initials(),
            firstName: this.firstName(),
            lastName: this.lastName(),
            title: this.title(),
            birthDate: !isNullOrUndefined(this.birthDate()) ? this.birthDate().toISOString() : null
        };
    }

    public static empty() {
        return new ConsultantInfo('', '', '', '', new Date(), true);
    }

    /**
     * Returns the full name of the consultant, including their title.
     * (<Title>) <FirstName> <LastName>
     * @returns {string}
     */
    public getFullName(): string {
        let title = !isNullOrUndefined(this.title()) ? this.title().trim() + ' ' : '';

        return title + this.firstName() + ' ' + this.lastName();
    }
}
