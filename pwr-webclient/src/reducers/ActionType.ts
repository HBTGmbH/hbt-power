/**
 * Created by nt on 29.05.2017.
 */

export enum ActionType {

    SaveLanguageSkill,
    SetModifiedStatus,
    ClearUserInitials,

    AddSkill,
    RemoveSkillFromProject,
    UserLoginFailed,
    ReplaceExportDocuments,

    SetUserInitials,

    LogOutUser,
    DeleteSkill,
    UpdateSkillRating,
    LogInUser,
    CreateProject,
    DeleteProject,
    SaveProject,
    SaveEntry,
    CreateEntry,
    DeleteEntry,
    APIRequestSuccess,
    ChangeLanguageSkillLevel,

    ChangeFirstName,
    ChangeLastName,
    ChangeBirthDate,
    RequestConsultants,
    ReceiveConsultants,
    // == Single ConsultantProfile Actions == //
    ChangeAbstract,
    // == Admin Actions
    ReceiveNotifications,
    ReceiveTrashedNotifications,
    AdminRequestStatus,
    SetCustomSkillFiltering,
    ChangeUsername,
    ChangePassword,
    ChangeAdminLoginStatus,
    LogInAdmin,
    LogOutAdmin,

    /**
     * Requests all consultant informations that are available. This should replace the old informations available.
     */
    ReceiveAllConsultants,
    ReceiveSingleConsultant,

    // == Notification Dialog
    OpenSkillNotificationDialog,
    SetSkillNotificationEditStatus,
    CloseAndResetSkillNotificationDlg,
    SetSkillNotificationError,
    SetSkillNotificationAction,
    SetNewSkillName,

    // == Report Upload
    SetReportUploadPending,
    SetReportUploadProgress,

    // == Statistics
    ReceiveSkillUsageMetrics,
    ReceiveRelativeSkillUsageMetrics,
    ReceiveProfileSkillMetrics,
    ReceiveNetwork,
    ReceiveConsultantClusterInfo,
    StatisticsAvailable,
    StatisticsNotAvailable,
    ReceiveScatterSkills,
    AddNameEntityUsageInfo,
    AddSkillUsageInfo,

    // == Skill reducer
    AddCategoryToTree,
    AddSkillToTree,
    ReadSkillHierarchy,
    SetTreeChildrenOpen,
    FilterTree,
    MoveCategory,

    UpdateSkillCategory,
    RemoveSkillCategory,
    MoveSkill,
    RemoveSkillServiceSkill,
    UpdateSkillServiceSkill,
    BatchAddSkills,
    LoadTree,

    SetCurrentSkillName,
    SetCurrentSkillRating,
    SetAddSkillStep,
    StepBackToSkillInfo,
    ChangeSkillComment,
    SetCurrentChoice,
    SetAddSkillError,
    SetNoCategoryReason,
    SetDoneMessage,
    SetAddToProjectId,
    ResetAddSkillDialog,

    // == Meta data
    AddOrReplaceBuildInfo,
    AddOrReplaceClientInfo,
    SetServiceAvaiabiltiy,

    // == Navigation
    SetCurrentLocation,
    SetNavigationTarget,
    DropNavigationTarget,

    // == View Profile
    SetViewProfile,
    RemoveViewProfile,
    SetSortInProgress,
    ResetViewState,
    ClearViewProfiles,

    // == Cross Cutting
    SetRequestPending,

    // == Templates
    SetTemplate,
    RemoveTemplate,
    ResetTemplate,
    ClearTemplates,
    CreateTemplate,
    ChangeTemplate,
    SetPreview,
    TemplateRequestFailed,

    // == Profile Actions
    UpdateEntrySuccessful,
    DeleteEntrySuccessful,
    UpdateProfileSkillSuccessful,
    DeleteProfileSkillSuccessful,
    UpdateProjectSuccessful,
    DeleteProjectSuccessful,

}