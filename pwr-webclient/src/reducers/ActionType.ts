/**
 * Created by nt on 29.05.2017.
 */

export enum ActionType {

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
    RequestNotifications,
    ReceiveNotifications,
    FailRequestNotifications,

    RequestTrashedNotifications,
    ReceiveTrashedNotifications,
    FailRequestTrashedNotifications,

    RequestNotificationTrashing,

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

    OpenSkillNotificationDialog,
    SetSkillNotificationEditStatus,
    CloseAndResetSkillNotificationDlg,
    SetSkillNotificationError,
    SetSkillNotificationAction,
    SetNewSkillName,

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

    // == MEta data
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
    ClearTemplates
}