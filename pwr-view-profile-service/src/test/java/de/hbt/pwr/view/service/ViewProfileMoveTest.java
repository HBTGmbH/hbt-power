package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Category;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests that validate that toggling visibility of profile elements works as intended.
 */
@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileMoveTest {

    private ViewProfile viewProfile;
    private ViewProfileSortService viewProfileSortService;


    @Before
    public void setUp() {
        viewProfileSortService = new ViewProfileSortService();
        viewProfile = new ViewProfile();
    }

    @Test
    public void projectShouldHaveMoved() {
        Project p1 = Project.builder().name("P1").build();
        Project p2 = Project.builder().name("P2").build();
        Project p3 = Project.builder().name("P3").build();
        viewProfile.getProjects().add(p1);
        viewProfile.getProjects().add(p2);
        viewProfile.getProjects().add(p3);
        // P1, P2, P3 // 2 -> 0 // P3, P1, P2
        viewProfileSortService.move(viewProfile, ProfileEntryType.PROJECT, 2, 0);
        assertThat(viewProfile.getProjects()).containsExactly(p3, p1, p2);
    }

    @Test
    public void displayCategoryShouldHaveMoved() {
        Category c1 = Category.builder().name("C1").build();
        Category c2 = Category.builder().name("C2").build();
        Category c3 = Category.builder().name("C3").build();
        viewProfile.getDisplayCategories().add(c1);
        viewProfile.getDisplayCategories().add(c2);
        viewProfile.getDisplayCategories().add(c3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.DISPLAY_CATEGORY, 2, 0);
        assertThat(viewProfile.getDisplayCategories()).containsExactly(c3, c1, c2);
    }

    @Test
    public void languageShouldHaveMoved() {
        Language l1 = Language.builder().name("L1").build();
        Language l2 = Language.builder().name("L2").build();
        Language l3 = Language.builder().name("L3").build();
        viewProfile.getLanguages().add(l1);
        viewProfile.getLanguages().add(l2);
        viewProfile.getLanguages().add(l3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.LANGUAGE, 2, 0);
        assertThat(viewProfile.getLanguages()).containsExactly(l3, l1, l2);
    }

    @Test
    public void careerShouldHaveMoved() {
        Career c1 = Career.builder().name("C1").build();
        Career c2 = Career.builder().name("C2").build();
        Career c3 = Career.builder().name("C3").build();
        viewProfile.getCareers().add(c1);
        viewProfile.getCareers().add(c2);
        viewProfile.getCareers().add(c3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.CAREER, 2, 0);
        assertThat(viewProfile.getCareers()).containsExactly(c3, c1, c2);
    }

    @Test
    public void educationShouldHaveMoved() {
        Education o1 = Education.builder().name("E1").build();
        Education o2 = Education.builder().name("E2").build();
        Education o3 = Education.builder().name("E3").build();
        viewProfile.getEducations().add(o1);
        viewProfile.getEducations().add(o2);
        viewProfile.getEducations().add(o3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.EDUCATION, 2, 0);
        assertThat(viewProfile.getEducations()).containsExactly(o3, o1, o2);
    }

    @Test
    public void KeySkillsShouldHaveMoved() {
        KeySkill o1 = KeySkill.builder().name("E1").build();
        KeySkill o2 = KeySkill.builder().name("E2").build();
        KeySkill o3 = KeySkill.builder().name("E3").build();
        viewProfile.getKeySkills().add(o1);
        viewProfile.getKeySkills().add(o2);
        viewProfile.getKeySkills().add(o3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.KEY_SKILL, 2, 0);
        assertThat(viewProfile.getKeySkills()).containsExactly(o3, o1, o2);
    }

    @Test
    public void ProjectRoleShouldHaveMoved() {
        ProjectRole o1 = ProjectRole.builder().name("E1").build();
        ProjectRole o2 = ProjectRole.builder().name("E2").build();
        ProjectRole o3 = ProjectRole.builder().name("E3").build();
        viewProfile.getProjectRoles().add(o1);
        viewProfile.getProjectRoles().add(o2);
        viewProfile.getProjectRoles().add(o3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.PROJECT_ROLE, 2, 0);
        assertThat(viewProfile.getProjectRoles()).containsExactly(o3, o1, o2);
    }

    @Test
    public void QualificationShouldHaveMoved() {
        Qualification o1 = Qualification.builder().name("E1").build();
        Qualification o2 = Qualification.builder().name("E2").build();
        Qualification o3 = Qualification.builder().name("E3").build();
        viewProfile.getQualifications().add(o1);
        viewProfile.getQualifications().add(o2);
        viewProfile.getQualifications().add(o3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.QUALIFICATION, 2, 0);
        assertThat(viewProfile.getQualifications()).containsExactly(o3, o1, o2);
    }

    @Test
    public void SectorShouldHAveMoved() {
        Sector o1 = Sector.builder().name("E1").build();
        Sector o2 = Sector.builder().name("E2").build();
        Sector o3 = Sector.builder().name("E3").build();
        viewProfile.getSectors().add(o1);
        viewProfile.getSectors().add(o2);
        viewProfile.getSectors().add(o3);
        viewProfileSortService.move(viewProfile, ProfileEntryType.SECTOR, 2, 0);
        assertThat(viewProfile.getSectors()).containsExactly(o3, o1, o2);
    }

}