/**
 * A suggestion of the skill search: the name of the skill and, if the search term matched one of its aliases better
 * than the name, that alias (Kubernetes for K8S)
 */
export interface SkillSuggestion {
    name: string;
    matchingAlias?: string | null;
}
