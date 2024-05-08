export interface NavigationStore {
    currentLocation: string;
    targetLocation: string;
    confirmDialogOpen: boolean;
}

export function emptyNavigationStore(): NavigationStore {
    return {
        currentLocation: '',
        confirmDialogOpen: false,
        targetLocation: ''
    }
}
