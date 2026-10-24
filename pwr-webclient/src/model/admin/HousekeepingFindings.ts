/**
 * What a housekeeping check of a service found (#242): how many, up to ten examples, or why the check could not run
 */
export interface HousekeepingFindings {
    /** Key of the check, names it through `AdminClient.Housekeeping.Check.<check>` */
    check: string;
    count: number;
    examples: Array<string>;
    /** Set if the check could not run, e.g. because another service did not answer */
    error?: string;
    /** Storage the findings take, if the check knows it (#289) */
    bytes?: number;
}
