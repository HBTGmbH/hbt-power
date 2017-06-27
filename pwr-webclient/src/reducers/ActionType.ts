/**
 * Created by nt on 29.05.2017.
 */

export enum ActionType {

    AddSkill,
    SwapIndex,
    UserLoginFailed,

    ChangeViewProfileName,
    ChangeViewProfileDescription,
    ReceiveViewProfile,
    SortViewProfile,
    SetSelectedIndexes,
    SelectViewProfile,
    DeleteViewProfile,
    SaveViewProfile,
    /* Clears all cached view profiles from the client */
    ClearViewProfiles,
    ReplaceExportDocuments,

    LogOutUser,
    DeleteSkill,
    UpdateSkillRating,
    LogInUser,
    ShowProfile,
    CreateProject,
    DeleteProject,
    SaveProject,
    SaveEntry,
    CreateEntry,
    DeleteEntry,
    APIRequestSuccess,
    APIRequestSuccess_NoContent,
    APIRequestFail,
    APIRequestPending,
    ChangeLanguageSkillLevel,

    ChangeInitials,
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

    AdminNavigate,
    AdminRequestStatus,

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

    // == Statistics
    ReceiveSkillUsageMetrics,
    ReceiveRelativeSkillUsageMetrics,
    ReceiveProfileSkillMetrics,
    ReceiveNetwork,
    ReceiveConsultantClusterInfo,
    StatisticsAvailable,
    StatisticsNotAvailable,
    ReceiveScatterSkills
}