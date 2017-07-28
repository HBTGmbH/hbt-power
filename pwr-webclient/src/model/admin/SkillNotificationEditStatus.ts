/**
 * Possible states for the skill notification dialog. Transitions explained in comments
 */
export enum SkillNotificationEditStatus {
    /**
     * Dialog is closed
     * Transitions:
     * -> FETCHING_DATA on open
     */
    CLOSED,
    /**
     * Skill data is fetched
     * Transitions:
     * -> DISPLAY_INFO_NO_CATEGORY on success without an associated category
     * -> DISPLAY_INFO_CATEGORY on success with an associated category
     * -> DISPLAY_ERROR on fail
     * -> CLOSED on user input closing dialog
     */
    FETCHING_DATA,
    /**
     * Skill data is displayed with no category and an additional option to categorize
     * Transitions:
     * DISPLAY_INFO_CATEGORY_PENDING on categorization request
     * DISPLAY_ACTIONS on user input representing progress
     * CLOSED on user input closing dialog.
     */
    DISPLAY_INFO_NO_CATEGORY,
    /**
     * Skill data is displayed, but the categorization is pending; Progressing input is disabled.
     * Transitions:
     * DISPLAY_INFO_CATEGORY on success of the categorization operation
     * DISPLAY_INFO_CATEGORY_ERROR on fail of the categorization operation
     * CLOSED on user input closing dialog
     */
    DISPLAY_INFO_CATEGORY_PENDING,
    /**
     * Skill categorization has failed. Displayed. Progress is enabled again
     * Transitions:
     * DISPLAY_INFO_CATEGORY_PENDING on retry.
     * DISPLAY_ACTIONS on user progress
     * CLOSED on user input closing dialog
     */
    DISPLAY_INFO_CATEGORY_ERROR,
    /**
     * Skill data is displayed with a category.
     * Transitions:
     * DISPLAY_ACTIONS on user progress
     * CLOSED on user input closing dialog
     */
    DISPLAY_INFO_CATEGORY,
    /**
     * An error occured.
     * Transitions:
     * CLOSED on user input closing dialog.
     */
    DISPLAY_ERROR,
    /**
     * Edit dialog visible
     * Transotions:
     * DISPLAY_SUCCESS on ok
     */
    DISPLAY_EDIT_DIALOG,
    /**
     * Transitions:
     * CLOSED on confirm
     */
    DISPLAY_SUCCESS,

}