import {APIConsultant} from './APIProfile';

export class ConsultantInfo {

    private readonly _initials: string;
    private readonly _firstName: string;
    private readonly _lastName: string;
    private readonly _title: string;
    private readonly _birthDate: Date;
    private readonly _active: boolean;
    private readonly _profilePictureId: string;

    public initials() {
        return this._initials;
    };

    public setInitials(initials: string): ConsultantInfo {
        return new ConsultantInfo(initials, this.firstName(), this.lastName(), this.title(), this.birthDate(), this.active(), this.profilePictureId());
    }

    public firstName(): string {
        return this._firstName;
    };

    public setFirstName(firstName: string): ConsultantInfo {
        return new ConsultantInfo(this.initials(), firstName, this.lastName(), this.title(), this.birthDate(), this.active(), this.profilePictureId());
    }

    public lastName() {
        return this._lastName;
    };

    public setLastName(lastName: string): ConsultantInfo {
        return new ConsultantInfo(this.initials(), this.firstName(), lastName, this.title(), this.birthDate(), this.active(), this.profilePictureId());
    }

    public title() {
        return this._title;
    };

    public setTitle(title: string): ConsultantInfo {
        return new ConsultantInfo(this.initials(), this.firstName(), this.lastName(), title, this.birthDate(), this.active(), this.profilePictureId());
    }

    public birthDate() {
        return this._birthDate;
    };

    public setBirthDate(birthDate: Date): ConsultantInfo {
        return new ConsultantInfo(this.initials(), this.firstName(), this.lastName(), this.title(), birthDate, this.active(), this.profilePictureId());
    }

    public active() {
        return this._active;
    };

    public setActive(active: boolean): ConsultantInfo {
        return new ConsultantInfo(this.initials(), this.firstName(), this.lastName(), this.title(), this.birthDate(), active, this.profilePictureId());
    }

    public profilePictureId() {
        return this._profilePictureId;
    }

    public setProfilePictureId(profilePictureId: string): ConsultantInfo {
        return new ConsultantInfo(this.initials(), this.firstName(), this.lastName(), this.title(), this.birthDate(), this.active(), profilePictureId);
    }



    private constructor(initials: string, firstName: string, lastName: string, title: string,
                        birthDate: Date, active: boolean, profilePictureId: string) {
        this._initials = initials;
        this._firstName = firstName;
        this._lastName = lastName;
        this._title = title;
        this._birthDate = birthDate;
        this._active = active;
        this._profilePictureId = profilePictureId;
    }

    public static fromAPI(apiConsultant: APIConsultant) {
        return new ConsultantInfo(apiConsultant.initials, apiConsultant.firstName, apiConsultant.lastName,
            apiConsultant.title, new Date(apiConsultant.birthDate), apiConsultant.active, apiConsultant.profilePictureId);
    }

    public toAPI(): APIConsultant {
        return {
            active: this.active(),
            initials: this.initials(),
            firstName: this.firstName(),
            lastName: this.lastName(),
            title: this.title(),
            birthDate: this.birthDate() ? this.birthDate().toISOString() : null,
            profilePictureId: this.profilePictureId()
        };
    }

    public static empty() {
        return new ConsultantInfo('', '', '', '', new Date(), true, '');
    }

    /**
     * Returns the full name of the consultant, including their title.
     * (<Title>) <FirstName> <LastName>
     * @returns {string}
     */
    public getFullName(): string {
        let title = this._title ? (this._title.trim() + ' ') : '';
        return title + this.firstName() + ' ' + this.lastName();
    }
}
