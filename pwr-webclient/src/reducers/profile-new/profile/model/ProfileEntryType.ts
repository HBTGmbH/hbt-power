export enum ProfileEntryTypeName {
    LANGUAGE = 'languages',
    SECTOR = 'sectors',
    SPECIAL_FIELD = 'specialFieldEntries',
    TRAINING = 'trainingEntries',
    CAREER = 'careerEntries',
    QUALIFICATION = 'qualification',
    EDUCATION = 'education'
}

export type ProfileEntryType =
    'LANGUAGE'
    | 'SECTOR'
    | 'SPECIAL_FIELD'
    | 'TRAINING'
    | 'CAREER'
    | 'QUALIFICATION'
    | 'EDUCATION';
