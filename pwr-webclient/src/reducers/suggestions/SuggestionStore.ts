import {NameEntity} from '../profile-new/profile/model/NameEntity';

export interface SuggestionStore {
    allTrainings: Array<NameEntity>;
    allSpecialFields: Array<NameEntity>;
    allEducations: Array<NameEntity>;
    allLanguages: Array<NameEntity>;
    allIndustrialSectors: Array<NameEntity>;
    allQualifications: Array<NameEntity>;
    allCareers: Array<NameEntity>;
    allCompanies: Array<NameEntity>;
    allProjectRoles: Array<NameEntity>;
    allSkills:Array<String>;
}

export const emptyStore: SuggestionStore = {
    allTrainings: [],
    allSpecialFields: [],
    allEducations: [],
    allLanguages: [],
    allIndustrialSectors: [],
    allQualifications: [],
    allCareers: [],
    allCompanies: [],
    allProjectRoles: [],
    allSkills:[]
};