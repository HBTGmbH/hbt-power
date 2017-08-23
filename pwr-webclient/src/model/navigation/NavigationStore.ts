import {doop} from 'doop';

@doop
export class NavigationStore {
    @doop public get currentLocation() {return doop<string, this>()};

    @doop public get targetLocation() {return doop<string, this>()};

    @doop public get confirmDialogOpen() {return doop<boolean, this>()};

    private constructor(currentLocation: string, targetLocation: string, confirmDialogOpen: boolean) {
        return this.currentLocation(currentLocation).targetLocation(targetLocation).confirmDialogOpen(confirmDialogOpen);
    }

    public static empty() {
        return new NavigationStore("/", "", false);
    }
}