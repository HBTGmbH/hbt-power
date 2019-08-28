export enum RequestStatus {
    Pending,
    Successful,
    Failiure,
    Inactive
}

export enum APIRequestType {
    RequestSkillNames
}

export enum ProfileElementType {
    SectorEntry = 'SECTOR',
    TrainingEntry= 'TRAINING',
    EducationEntry = 'EDUCATION',
    QualificationEntry = 'QUALIFICATION',
    LanguageEntry = 'LANGUAGE',
    SpecialField = 'SPECIAL_FIELD',
    CareerEntry = 'CAREER',
    Company = 'COMPANY',
    ProjectRole = 'PROJECT_ROLE'
}
