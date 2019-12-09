/**
 * Created by nt on 29.05.2017.
 */

export enum ActionType {

    DeferAction = '[Deferred] Defer Single Action',
    ConfirmDeferredAction = '[Deferred] Confirm Action',
    RejectDeferredAction = '[Deferred] Reject Action',

    SaveLanguageSkill = '[Profile] SaveLanguageSkill',
    SetModifiedStatus = '[Profile] SetModifiedStatus',
    ClearUserInitials = '[Profile] ClearUserInitials',

    AddSkill = '[Profile] AddSkill',
    RemoveSkillFromProject = '[Profile] RemoveSkillFromProject',
    ReplaceExportDocuments = '[Profile] ReplaceExportDocuments',

    SetUserInitials = '[Profile] SetUserInitials',

    DeleteSkill = '[Profile] DeleteSkill',
    UpdateSkillRating = '[Profile] UpdateSkillRating',
    LogInUser = '[Profile] LogInUser',
    CreateProject = '[Profile] CreateProject',
    DeleteProject = '[Profile] DeleteProject',
    SaveProject = '[Profile] SaveProject',
    SaveEntry = '[Profile] SaveEntry',
    CreateEntry = '[Profile] CreateEntry',
    DeleteEntry = '[Profile] DeleteEntry',
    APIRequestSuccess = '[Profile] APIRequestSuccess',
    ChangeLanguageSkillLevel = '[Profile] ChangeLanguageSkillLevel',

    ChangeFirstName = '[Profile] ChangeFirstName',
    ChangeLastName = '[Profile] ChangeLastName',
    ChangeBirthDate = '[Profile] ChangeBirthDate',
    RequestConsultants = '[Profile] RequestConsultants',
    ReceiveConsultants = '[Profile] ReceiveConsultants',
    // == Single ConsultantProfile Actions == //
    ChangeAbstract = '[Profile] ChangeAbstract',
    // == Admin Actions
    ReceiveNotifications = '[Profile] ReceiveNotifications',
    ReceiveTrashedNotifications = '[Profile] ReceiveTrashedNotifications',
    AdminRequestStatus = '[Profile] AdminRequestStatus',
    SetCustomSkillFiltering = '[Skill] SetCustomSkillFiltering',
    ChangeUsername = '[Profile] ChangeUsername',
    ChangePassword = '[Profile] ChangePassword',
    ChangeAdminLoginStatus = '[Profile] ChangeAdminLoginStatus',
    LogInAdmin = '[Profile] LogInAdmin',
    LogOutAdmin = '[Profile] LogOutAdmin',

    /**
     * Requests all consultant informations that are available. This should replace the old informations available.
     */
    ReceiveAllConsultants = '[Profile] ReceiveAllConsultants',
    ReceiveSingleConsultant = '[Profile] ReceiveSingleConsultant',

    // == Notification Dialog
    OpenSkillNotificationDialog = '[Profile] OpenSkillNotificationDialog',
    SetSkillNotificationEditStatus = '[Profile] SetSkillNotificationEditStatus',
    CloseAndResetSkillNotificationDlg = '[Profile] CloseAndResetSkillNotificationDlg',
    SetSkillNotificationError = '[Profile] SetSkillNotificationError',
    SetSkillNotificationAction = '[Profile] SetSkillNotificationAction',
    SetNewSkillName = '[Profile] SetNewSkillName',

    // == Report Upload
    SetReportUploadPending = '[Report] SetReportUploadPending',
    SetReportUploadProgress = '[Report] SetReportUploadProgress',

    // == Statistics
    ReceiveSkillUsageMetrics = '[Statistics] ReceiveSkillUsageMetrics',
    ReceiveRelativeSkillUsageMetrics = '[Statistics] ReceiveRelativeSkillUsageMetrics',
    ReceiveProfileSkillMetrics = '[Statistics] ReceiveProfileSkillMetrics',
    ReceiveNetwork = '[Statistics] ReceiveNetwork',
    ReceiveConsultantClusterInfo = '[Statistics] ReceiveConsultantClusterInfo',
    StatisticsAvailable = '[Statistics] StatisticsAvailable',
    StatisticsNotAvailable = '[Statistics] StatisticsNotAvailable',
    ReceiveScatterSkills = '[Statistics] ReceiveScatterSkills',
    AddNameEntityUsageInfo = '[Statistics] AddNameEntityUsageInfo',
    AddSkillUsageInfo = '[Statistics] AddSkillUsageInfo',

    // == Skill reducer
    AddCategoryToTree = '[Skill] AddCategoryToTree',
    AddSkillToTree = '[Skill] AddSkillToTree',
    ReadSkillHierarchy = '[Skill] ReadSkillHierarchy',
    SetTreeChildrenOpen = '[Skill] SetTreeChildrenOpen',
    FilterTree = '[Skill] FilterTree',
    MoveCategory = '[Skill] MoveCategory',
    UpdateSkillCategory = '[Skill] UpdateSkillCategory',
    RemoveSkillCategory = '[Skill] RemoveSkillCategory',
    MoveSkill = '[Skill] MoveSkill',
    RemoveSkillServiceSkill = '[Skill] RemoveSkillServiceSkill',
    UpdateSkillServiceSkill = '[Skill] UpdateSkillServiceSkill',
    BatchAddSkills = '[Skill] BatchAddSkills',
    LoadTree = '[Skill] LoadTree',
    SetCurrentSkillName = '[Skill] SetCurrentSkillName',
    SetCurrentSkillRating = '[Skill] SetCurrentSkillRating',
    SetAddSkillStep = '[Skill] SetAddSkillStep',
    StepBackToSkillInfo = '[Skill] StepBackToSkillInfo',
    ChangeSkillComment = '[Skill] ChangeSkillComment',
    SetCurrentChoice = '[Skill] SetCurrentChoice',
    SetAddSkillError = '[Skill] SetAddSkillError',
    SetNoCategoryReason = '[Skill] SetNoCategoryReason',
    SetDoneMessage = '[Skill] SetDoneMessage',
    SetAddToProjectId = '[Skill] SetAddToProjectId',
    ResetAddSkillDialog = '[Skill] ResetAddSkillDialog',

    // == Meta data
    AddOrReplaceBuildInfo = '[MetaData] AddOrReplaceBuildInfo',
    AddOrReplaceClientInfo = '[MetaData] AddOrReplaceClientInfo',
    SetServiceAvaiabiltiy = '[MetaData] SetServiceAvaiabiltiy',

    // == Navigation
    SetCurrentLocation = '[Navigation] SetCurrentLocation',
    SetNavigationTarget = '[Navigation] SetNavigationTarget',
    DropNavigationTarget = '[Navigation] DropNavigationTarget',

    // == View Profile
    SetViewProfile = '[ViewProfile] SetViewProfile',
    RemoveViewProfile = '[ViewProfile] RemoveViewProfile',
    SetSortInProgress = '[ViewProfile] SetSortInProgress',
    ResetViewState = '[ViewProfile] ResetViewState',
    ClearViewProfiles = '[ViewProfile] ClearViewProfiles',
    SetParentCategories = '[ViewProfile] SetParentCategories',
    ClearParentCategories = '[ViewProfile] ClearParentCategories',

    // == Cross Cutting
    SetRequestPending = '[Cross Cutting] SetRequestPending',
    SetLoginStatus = '[Cross Cutting] Set Login Status',
    SetLoginError = '[Cross Cutting] Set Login Error',

    // == Templates
    SetTemplate = '[ViewProfile] SetTemplate',
    RemoveTemplate = '[ViewProfile] RemoveTemplate',
    ResetTemplate = '[ViewProfile] ResetTemplate',
    ClearTemplates = '[ViewProfile] ClearTemplates',
    CreateTemplate = '[ViewProfile] CreateTemplate',
    ChangeTemplate = '[ViewProfile] ChangeTemplate',
    SetPreview = '[ViewProfile] SetPreview',
    TemplateRequestFailed = '[ViewProfile] TemplateRequestFailed',
    AsyncDeleteTemplate = '[Async] DeleteTemplate',

    // == Profile Actions
    SetDescription = '[Profile] Set Description',
    UpdateEntrySuccessful = '[Profile] UpdateEntrySuccessful',
    DeleteEntrySuccessful = '[Profile] DeleteEntrySuccessful',
    UpdateProfileSkillSuccessful = '[Profile] UpdateProfileSkillSuccessful',
    DeleteProfileSkillSuccessful = '[Profile] DeleteProfileSkillSuccessful',
    UpdateProjectSuccessful = '[Profile] UpdateProjectSuccessful',
    DeleteProjectSuccessful = '[Profile] DeleteProjectSuccessful',
    LoadProfileAction = '[Profile] LoadProfileAction',
    LoadBaseProfileAction = '[Profile] LoadBaseProfileAction',
    LoadEntriesAction = '[Profile] LoadEntriesAction',
    LoadSkillsAction = '[Profile] LoadSkillsAction',
    LoadProjectsAction = '[Profile] LoadProjectsAction',

    // == Profile => Projects
    SelectProject = '[Profile][Project] SelectProject',
    SetEditingProject = '[Profile][Project] SetEditingProject',
    EditSelectedProject = '[Profile][Project] EditSelectedProject',
    CancelEditSelectedProject = '[Profile][Project] CancelEditSelectedProject',
    AddNewProject = '[Profile][Project] Add New Project to Profile',

    ResetProfileStore = '[Profile] Reset to Default',

    // == Consultant
    UpdateConsultantAction = '[Profile] UpdateConsultantAction',

    // == SuggestionActions
    UpdateSuggestionField = '[Profile] UpdateSuggestionField',
    UpdateSkillSuggestionField = '[Profile] UpdateSkillSuggestionField',

    // == Async, Deferrable Actions
    AsyncDeleteEntry = '[Async] Delete Entry',

    ResetReportStore = '[Report] resets the state',
    LoadReportsAction = '[Report] loads all Reports for a Consultant',


    // == Skill Versions
    LoadVersionsForSkill = '[SkillInfo] LoadVersionsForSkill',
    ClearVersions = '[SkillInfo] ClearVersions',
    DeleteVersionFromSkill = '[SkillInfo] DeleteVersionFromSkill',
    LoadSkillInfo = '[SkillInfo] LoadSkillInfo',

    AsyncDeleteVersion = '[Async] DeleteVersionFromSkill',
}
