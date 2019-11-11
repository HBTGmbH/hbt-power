/**
 * Created by nt on 29.05.2017.
 */

export enum ActionType {

    DeferAction = "[Deferred] Defer Single Action",
    ConfirmDeferredAction = "[Deferred] Confirm Action",
    RejectDeferredAction = "[Deferred] Reject Action",

    SaveLanguageSkill = "SaveLanguageSkill",
    SetModifiedStatus = "SetModifiedStatus",
    ClearUserInitials = "ClearUserInitials",

    AddSkill = "AddSkill",
    RemoveSkillFromProject = "RemoveSkillFromProject",
    ReplaceExportDocuments = "ReplaceExportDocuments",

    SetUserInitials = "SetUserInitials",

    DeleteSkill = "DeleteSkill",
    UpdateSkillRating = "UpdateSkillRating",
    LogInUser = "LogInUser",
    CreateProject = "CreateProject",
    DeleteProject = "DeleteProject",
    SaveProject = "SaveProject",
    SaveEntry = "SaveEntry",
    CreateEntry = "CreateEntry",
    DeleteEntry = "DeleteEntry",
    APIRequestSuccess = "APIRequestSuccess",
    ChangeLanguageSkillLevel = "ChangeLanguageSkillLevel",

    ChangeFirstName = "ChangeFirstName",
    ChangeLastName = "ChangeLastName",
    ChangeBirthDate = "ChangeBirthDate",
    RequestConsultants = "RequestConsultants",
    ReceiveConsultants = "ReceiveConsultants",
    // == Single ConsultantProfile Actions == //
    ChangeAbstract = "ChangeAbstract",
    // == Admin Actions
    ReceiveNotifications = "ReceiveNotifications",
    ReceiveTrashedNotifications = "ReceiveTrashedNotifications",
    AdminRequestStatus = "AdminRequestStatus",
    SetCustomSkillFiltering = "SetCustomSkillFiltering",
    ChangeUsername = "ChangeUsername",
    ChangePassword = "ChangePassword",
    ChangeAdminLoginStatus = "ChangeAdminLoginStatus",
    LogInAdmin = "LogInAdmin",
    LogOutAdmin = "LogOutAdmin",

    /**
     * Requests all consultant informations that are available. This should replace the old informations available.
     */
    ReceiveAllConsultants = "ReceiveAllConsultants",
    ReceiveSingleConsultant = "ReceiveSingleConsultant",

    // == Notification Dialog
    OpenSkillNotificationDialog = "OpenSkillNotificationDialog",
    SetSkillNotificationEditStatus = "SetSkillNotificationEditStatus",
    CloseAndResetSkillNotificationDlg = "CloseAndResetSkillNotificationDlg",
    SetSkillNotificationError = "SetSkillNotificationError",
    SetSkillNotificationAction = "SetSkillNotificationAction",
    SetNewSkillName = "SetNewSkillName",

    // == Report Upload
    SetReportUploadPending = "SetReportUploadPending",
    SetReportUploadProgress = "SetReportUploadProgress",

    // == Statistics
    ReceiveSkillUsageMetrics = "ReceiveSkillUsageMetrics",
    ReceiveRelativeSkillUsageMetrics = "ReceiveRelativeSkillUsageMetrics",
    ReceiveProfileSkillMetrics = "ReceiveProfileSkillMetrics",
    ReceiveNetwork = "ReceiveNetwork",
    ReceiveConsultantClusterInfo = "ReceiveConsultantClusterInfo",
    StatisticsAvailable = "StatisticsAvailable",
    StatisticsNotAvailable = "StatisticsNotAvailable",
    ReceiveScatterSkills = "ReceiveScatterSkills",
    AddNameEntityUsageInfo = "AddNameEntityUsageInfo",
    AddSkillUsageInfo = "AddSkillUsageInfo",

    // == Skill reducer
    AddCategoryToTree = "AddCategoryToTree",
    AddSkillToTree = "AddSkillToTree",
    ReadSkillHierarchy = "ReadSkillHierarchy",
    SetTreeChildrenOpen = "SetTreeChildrenOpen",
    FilterTree = "FilterTree",
    MoveCategory = "MoveCategory",
    UpdateSkillCategory = "UpdateSkillCategory",
    RemoveSkillCategory = "RemoveSkillCategory",
    MoveSkill = "MoveSkill",
    RemoveSkillServiceSkill = "RemoveSkillServiceSkill",
    UpdateSkillServiceSkill = "UpdateSkillServiceSkill",
    BatchAddSkills = "BatchAddSkills",
    LoadTree = "LoadTree",
    SetCurrentSkillName = "SetCurrentSkillName",
    SetCurrentSkillRating = "SetCurrentSkillRating",
    SetAddSkillStep = "SetAddSkillStep",
    StepBackToSkillInfo = "StepBackToSkillInfo",
    ChangeSkillComment = "ChangeSkillComment",
    SetCurrentChoice = "SetCurrentChoice",
    SetAddSkillError = "SetAddSkillError",
    SetNoCategoryReason = "SetNoCategoryReason",
    SetDoneMessage = "SetDoneMessage",
    SetAddToProjectId = "SetAddToProjectId",
    ResetAddSkillDialog = "ResetAddSkillDialog",

    // == Meta data
    AddOrReplaceBuildInfo = "AddOrReplaceBuildInfo",
    AddOrReplaceClientInfo = "AddOrReplaceClientInfo",
    SetServiceAvaiabiltiy = "SetServiceAvaiabiltiy",

    // == Navigation
    SetCurrentLocation = "SetCurrentLocation",
    SetNavigationTarget = "SetNavigationTarget",
    DropNavigationTarget = "DropNavigationTarget",

    // == View Profile
    SetViewProfile = "SetViewProfile",
    RemoveViewProfile = "RemoveViewProfile",
    SetSortInProgress = "SetSortInProgress",
    ResetViewState = "ResetViewState",
    ClearViewProfiles = "ClearViewProfiles",
    SetParentCategories = "SetParentCategories",
    ClearParentCategories = "ClearParentCategories",

    // == Cross Cutting
    SetRequestPending = "SetRequestPending",
    SetLoginStatus = '[Cross Cutting] Set Login Status',
    SetLoginError = '[Cross Cutting] Set Login Error',

    // == Templates
    SetTemplate = "SetTemplate",
    RemoveTemplate = "RemoveTemplate",
    ResetTemplate = "ResetTemplate",
    ClearTemplates = "ClearTemplates",
    CreateTemplate = "CreateTemplate",
    ChangeTemplate = "ChangeTemplate",
    SetPreview = "SetPreview",
    TemplateRequestFailed = "TemplateRequestFailed",

    // == Profile Actions
    SetDescription = "[Profile] Set Description",
    UpdateEntrySuccessful = "[Profile] UpdateEntrySuccessful",
    DeleteEntrySuccessful = "[Profile] DeleteEntrySuccessful",
    UpdateProfileSkillSuccessful = "[Profile] UpdateProfileSkillSuccessful",
    DeleteProfileSkillSuccessful = "[Profile] DeleteProfileSkillSuccessful",
    UpdateProjectSuccessful = "[Profile] UpdateProjectSuccessful",
    DeleteProjectSuccessful = "[Profile] DeleteProjectSuccessful",
    LoadProfileAction = '[Profile] LoadProfileAction',
    LoadBaseProfileAction = "[Profile] LoadBaseProfileAction",
    LoadEntriesAction = "[Profile] LoadEntriesAction",
    LoadSkillsAction = "[Profile] LoadSkillsAction",
    LoadProjectsAction = "[Profile] LoadProjectsAction",

    // == Profile => Projects
    SelectProject = "[Profile][Project] SelectProject",
    SetEditingProject = "[Profile][Project] SetEditingProject",
    EditSelectedProject = "[Profile][Project] EditSelectedProject",
    CancelEditSelectedProject = "[Profile][Project] CancelEditSelectedProject",
    AddNewProject = "[Profile][Project] Add New Project to Profile",

    ResetProfileStore = "[Profile] Reset to Default",

    // == Consultant
    UpdateConsultantAction = "UpdateConsultantAction",

    // == SuggestionActions
    UpdateSuggestionField = "UpdateSuggestionField",
    UpdateSkillSuggestionField = "UpdateSkillSuggestionField",

    // == Async, Deferrable Actions
    AsyncDeleteEntry = "[Async] Delete Entry",

    ResetReportStore = "[Report] resets the state",
    LoadReportsAction = "[Report] loads all Reports for a Consultant"

}
