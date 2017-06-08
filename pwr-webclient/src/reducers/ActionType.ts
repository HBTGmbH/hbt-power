/**
 * Created by nt on 29.05.2017.
 */

export enum ActionType {

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
    ReceiveSingleConsultant,
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

    ReceiveAllConsultants,
}