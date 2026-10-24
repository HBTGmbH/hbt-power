export interface IViewEntry {
    name: string;
    enabled: boolean;
    /** The name in the language of the view profile (#291), if the profile element has a localization for it */
    localizedName?: string;
}