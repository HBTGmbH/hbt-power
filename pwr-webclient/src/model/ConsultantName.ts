/**
 * How the app names a consultant (#216), from GET /consultants/names: the short name ("Klaus", "Kai B.") everywhere,
 * the full name in the tooltip
 */
export interface ConsultantName {
    initials: string;
    shortName: string;
    fullName: string;
}
