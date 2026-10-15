/**
 * Steps necessary to add a skill to a profile
 */
export enum AddSkillStep {
    /**
     * Show info editing dialog. Initial state.
     * Transitions:
     * Progress -> CATEGORY_REQUEST_PENDING
     */
    SKILL_INFO,
    /**
     * The category resolving is currently in progress.
     * Transitions:
     * not found -> SHOW_EDITING_OPTIONS
     * found -> SHOW_CATEGORY
     */
    CATEGORY_REQUEST_PENDING,
    /**
     * Category has been found.
     * Transitions:
     * category fits -> DONE
     * category does not fit (Probably wrong skill name) -> SKILL_INFO
     */
    SHOW_CATEGORY,
    /**
     * No category found. Display editing options. Transitions:
     * Add with comment -> DONE
     * Change skill -> SKILL_INFO
     */
    SHOW_EDITING_OPTIONS,
    /**
     */
    DONE,
    NONE
}