import {doop, Doop} from 'doop';

@doop
export class Project {

    @doop
    public get id() {
        return doop<string, this>();
    }
    @doop
    public get name() {
        return doop<string, this>();
    }

    @doop
    public get endCustomer() {
        return doop<string, this>();
    }

    @doop
    public get startDate() {
        return doop<Date, this>();
    }

    @doop
    public get endDate() {
        return doop<Date, this>();
    }

    @doop
    public get description() {
        return doop<string, this>();
    }

    @doop
    public get broker() {
        return doop<string, this>();
    }

    @doop
    public get role() {
        return doop<string, this>();
    }

    public constructor(id: string, name: string, endCustomer: string, startDate: Date, endDate: Date, description: string, broker: string, role: string) {
        this.id(id).name(name).endCustomer(endCustomer).startDate(startDate).endDate(endDate).description(description).broker(broker).role(role);
    }


}