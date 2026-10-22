package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.LocalizedQualifier;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Names in the language of a view profile (#174). Skill tree:
 * <pre>
 * Methods (10)              deu: Methoden
 *   Agile Methods (20)      deu: Agile Methoden
 *     Scrum                 deu: Scrum (agiles Vorgehensmodell)
 *     Kanban                no localization
 * </pre>
 * "Excel" is a skill of a project that the skill tree doesn't know.
 */
public class ViewProfileLocalizationServiceTest {

    private final SkillServiceClient skillServiceClient = mock(SkillServiceClient.class);
    private final ViewProfileLocalizationService service = new ViewProfileLocalizationService(skillServiceClient);
    private ViewProfile viewProfile;
    private Category agile;
    private Skill scrum;
    private Skill kanban;
    private Skill projectScrum;
    private Skill projectExcel;

    private static SkillServiceCategory category(int id, String name, SkillServiceCategory parent, String german) {
        SkillServiceCategory category = new SkillServiceCategory(name, parent);
        category.setId(id);
        if (german != null) {
            category.getQualifiers().add(new LocalizedQualifier("deu", german));
        }
        return category;
    }

    private void serviceSkill(String name, SkillServiceCategory category, String german) {
        SkillServiceSkill skill = new SkillServiceSkill(name, category);
        if (german != null) {
            skill.getQualifiers().add(new LocalizedQualifier("deu", german));
        }
        when(skillServiceClient.getSkillByName(name)).thenReturn(skill);
    }

    @Before
    public void setUp() {
        SkillServiceCategory methods = category(10, "Methods", null, "Methoden");
        SkillServiceCategory agileMethods = category(20, "Agile Methods", methods, "Agile Methoden");
        serviceSkill("Scrum", agileMethods, "Scrum (agiles Vorgehensmodell)");
        serviceSkill("Kanban", agileMethods, null);

        agile = Category.builder().id(20L).name("Agile Methods").enabled(true).isDisplay(true)
                .displaySkills(new ArrayList<>()).build();
        scrum = Skill.builder().name("Scrum").enabled(true).displayCategory(agile).build();
        kanban = Skill.builder().name("Kanban").enabled(true).displayCategory(agile).build();
        projectScrum = Skill.builder().name("Scrum").enabled(true).build();
        projectExcel = Skill.builder().name("Excel").enabled(true).build();
        Project project = new Project();
        project.setSkills(new ArrayList<>(Arrays.asList(projectScrum, projectExcel)));

        viewProfile = new ViewProfile();
        viewProfile.getDisplayCategories().add(agile);
        viewProfile.getProjects().add(project);
    }

    @Test
    public void withLanguage_fillsTheLocalizationsOfSkillsCategoriesAndProjectSkills() {
        service.setLocalization(viewProfile, "deu");

        assertThat(viewProfile.getLocalization()).isEqualTo("deu");
        assertThat(scrum.getLocalizedName()).isEqualTo("Scrum (agiles Vorgehensmodell)");
        assertThat(kanban.getLocalizedName()).isNull();
        assertThat(agile.getLocalizedName()).isEqualTo("Agile Methoden");
        assertThat(projectScrum.getLocalizedName()).isEqualTo("Scrum (agiles Vorgehensmodell)");
        assertThat(projectExcel.getLocalizedName()).isNull();
        // The names stay the key
        assertThat(scrum.getName()).isEqualTo("Scrum");
        assertThat(agile.getName()).isEqualTo("Agile Methods");
    }

    @Test
    public void asksTheSkillServiceOncePerSkill() {
        service.setLocalization(viewProfile, "deu");

        verify(skillServiceClient, times(1)).getSkillByName("Scrum");
    }

    @Test
    public void withoutLanguage_clearsTheLocalizedNames() {
        service.setLocalization(viewProfile, "deu");
        service.setLocalization(viewProfile, " ");

        assertThat(viewProfile.getLocalization()).isNull();
        assertThat(scrum.getLocalizedName()).isNull();
        assertThat(agile.getLocalizedName()).isNull();
        assertThat(projectScrum.getLocalizedName()).isNull();
        // Scrum, Kanban and Excel for "deu", none for clearing
        verify(skillServiceClient, times(3)).getSkillByName(anyString());
    }

    @Test
    public void withALanguageWithoutLocalizations_hasNoLocalizedNames() {
        service.setLocalization(viewProfile, "eng");

        assertThat(scrum.getLocalizedName()).isNull();
        assertThat(agile.getLocalizedName()).isNull();
    }

    @Test
    public void localizedNames_areNoPartOfEquality() {
        Skill before = scrum.toBuilder().displayCategory(null).build();

        service.setLocalization(viewProfile, "deu");

        // Merging ("Aktualisieren") compares the skills of the old and the new view profile
        assertThat(scrum.toBuilder().displayCategory(null).build()).isEqualTo(before);
    }
}
