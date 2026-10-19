export interface NavigationStore {
    currentLocation: string;
    /**
     * The UnsavedChangesDialog is open
     */
    confirmDialogOpen: boolean;
}

export function emptyNavigationStore(): NavigationStore {
    return {
        currentLocation: '',
        confirmDialogOpen: false
    }
}
