import {doop} from 'doop';
import {
    APIViewCareer,
    APIViewEducation, APIViewKeySkill, APIViewLanguage, APIViewProject, APIViewQualification, APIViewSector,
    APIViewSkill,
    APIViewTraining
} from './APIViewProfile';
@doop
export class ViewElement {
    @doop
    public get enabled() {return doop<boolean, this>()};

    @doop
    public get elementId() {return doop<string, this>()};

    private constructor(enabled: boolean, elementId: string) {
        return this.enabled(enabled).elementId(elementId);
    }

    public static create(enabled: boolean, elementId: string) {
        return new ViewElement(enabled, elementId);
    }

    public static fromAPIViewEducation(view: APIViewEducation) {
        return new ViewElement(view.selected, String(view.educationEntry.id));
    }

    public static fromAPIViewQualification(view: APIViewQualification) {
        return new ViewElement(view.selected, String(view.qualificationEntry.id));
    }

    public static fromAPIViewTraining(view: APIViewTraining) {
        return new ViewElement(view.selected, String(view.trainingEntry.id));
    }

    public static fromAPIViewSector(view: APIViewSector) {
        return new ViewElement(view.selected, String(view.sectorEntry.id));
    }

    public static fromAPIViewLanguage(view: APIViewLanguage) {
        return new ViewElement(view.selected, String(view.languageSkill.id));
    }

    public static fromAPIViewProject(view: APIViewProject) {
        return new ViewElement(view.selected, String(view.project.id));
    }

    public static fromAPIViewKeySkill(view: APIViewKeySkill) {
        return new ViewElement(view.selected, String(view.keySkillEntry.id));
    }

    public static fromAPIViewCareer(view: APIViewCareer) {
        return new ViewElement(view.selected, String(view.careerEntry.id));
    }

    public static fromAPIViewSkill(view: APIViewSkill) {
        return new ViewElement(view.selected, String(view.skill.id));
    }

}