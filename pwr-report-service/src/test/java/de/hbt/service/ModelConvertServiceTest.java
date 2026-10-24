package de.hbt.service;

import de.hbt.model.ReportInfo;
import de.hbt.model.export.Profil;
import de.hbt.model.export.Skill;
import de.hbt.model.view.ViewCategory;
import de.hbt.model.view.ViewProfile;
import de.hbt.model.view.ViewProject;
import de.hbt.model.view.ViewSkill;
import de.hbt.model.view.ViewSkillVersion;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

/**
 * Skills in the export: their versions (#151), categories switched off (#159), names in a language (#174); projects
 */
class ModelConvertServiceTest {

    private final ModelConvertService modelConvertService = new ModelConvertService();

    private static ViewSkillVersion version(String name, boolean enabled) {
        ViewSkillVersion version = new ViewSkillVersion();
        version.setName(name);
        version.setEnabled(enabled);
        return version;
    }

    private static ReportInfo reportInfo(Boolean showSkillVersions) {
        ViewSkill java = new ViewSkill();
        java.setName("Java");
        java.setRating(5);
        java.setEnabled(true);
        java.setVersions(new ArrayList<>(Arrays.asList(version("8", false), version("17", true), version("21", true))));
        ViewCategory category = new ViewCategory();
        category.setName("Programming Languages");
        category.setEnabled(true);
        category.setDisplaySkills(new ArrayList<>(Arrays.asList(java)));

        ReportInfo reportInfo = new ReportInfo();
        reportInfo.name = "Max Mustermann";
        reportInfo.viewProfile = new ViewProfile().toBuilder()
                .displayCategories(new ArrayList<>(Arrays.asList(category)))
                .showSkillVersions(showSkillVersions)
                .build();
        return reportInfo;
    }

    private List<Skill> skills(Boolean showSkillVersions) {
        Profil profil = modelConvertService.convert(reportInfo(showSkillVersions), null);
        return profil.getSkills();
    }

    @Test
    void shouldExportEnabledVersions_whenShown() {
        assertThat(skills(true)).extracting(Skill::getVersions).containsExactly("17, 21");
    }

    @Test
    void shouldExportNoVersions_whenHidden() {
        List<Skill> skills = skills(false);
        assertThat(skills).hasSize(1);
        assertThat(skills.get(0).getGruppe()).isEqualTo("Programming Languages");
        assertThat(skills.get(0).getVersions()).isNull();
    }

    @Test
    void shouldExportNoSkillOfACategorySwitchedOff() {
        ReportInfo reportInfo = reportInfo(true);
        reportInfo.viewProfile.getDisplayCategories().get(0).setEnabled(false);
        assertThat(modelConvertService.convert(reportInfo, null).getSkills()).isEmpty();
    }

    @Test
    void shouldExportVersions_whenTheSettingIsMissing() {
        assertThat(skills(null)).extracting(Skill::getVersions).containsExactly("17, 21");
    }

    /**
     * With a language the view profile carries the localizations next to the names (#174)
     */
    @Test
    void shouldExportLocalizedNames_whenTheViewProfileHasThem() {
        ReportInfo reportInfo = reportInfo(true);
        ViewCategory category = reportInfo.viewProfile.getDisplayCategories().get(0);
        category.setLocalizedName("Programmiersprachen");
        category.getDisplaySkills().get(0).setLocalizedName("Java (Programmiersprache)");
        ViewSkill projectSkill = new ViewSkill();
        projectSkill.setName("Java");
        projectSkill.setLocalizedName("Java (Programmiersprache)");
        projectSkill.setEnabled(true);
        ViewSkill unknownSkill = new ViewSkill();
        unknownSkill.setName("Excel");
        unknownSkill.setEnabled(true);
        ViewProject project = new ViewProject();
        project.setName("Projekt");
        project.setEnabled(true);
        project.setSkills(new ArrayList<>(Arrays.asList(projectSkill, unknownSkill)));
        reportInfo.viewProfile.getProjects().add(project);

        Profil profil = modelConvertService.convert(reportInfo, null);

        assertThat(profil.getSkills()).extracting(skill -> skill.getBezeichnung().getHauptbegriff().getBezeichnung(), Skill::getGruppe)
                .containsExactly(tuple("Java (Programmiersprache)", "Programmiersprachen"));
        assertThat(profil.getProjekte().get(0).getSkills())
                .extracting(skill -> skill.getBezeichnung().getHauptbegriff().getBezeichnung())
                .containsExactly("Java (Programmiersprache)", "Excel");
    }

    @Test
    void shouldExportTheNamesOfTheSkillTree_withoutLocalizations() {
        assertThat(skills(true)).extracting(skill -> skill.getBezeichnung().getHauptbegriff().getBezeichnung(), Skill::getGruppe)
                .containsExactly(tuple("Java", "Programming Languages"));
    }

    /**
     * The view profile knows no consultant per project, so the field stays empty instead of "TODO" (#253)
     */
    @Test
    void projectHasNoBerater() {
        ReportInfo reportInfo = reportInfo(true);
        ViewProject project = new ViewProject();
        project.setName("Projekt");
        project.setEnabled(true);
        reportInfo.viewProfile.getProjects().add(project);

        Profil profil = modelConvertService.convert(reportInfo, null);

        assertThat(profil.getProjekte()).hasSize(1);
        assertThat(profil.getProjekte().get(0).getBerater()).isNull();
    }
}
