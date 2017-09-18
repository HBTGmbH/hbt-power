export enum RequestStatus {
    Pending,
    Successful,
    Failiure,
    Inactive
}

export enum APIRequestType {
    /**
     * Request requested all skill names.
     */
    RequestSkillNames,
    RequestCareers,
    RequestKeySkills,
    RequestProjectRoles,
    RequestCompanies,
    RequestSectors,
    RequestTrainings,
    RequestQualifications,
    RequestEducations,
    RequestProfile,
    RequestCreateViewProfile,
    SaveProfile,
    RequestLanguages,
    RequestExportDocs
}

export enum ProfileElementType {
    SkillEntry,
    SectorEntry,
    TrainingEntry,
    EducationEntry,
    QualificationEntry,
    LanguageEntry,
    KeySkill,
    Project,
    CareerEntry,
    Company,
    ProjectRole
}
