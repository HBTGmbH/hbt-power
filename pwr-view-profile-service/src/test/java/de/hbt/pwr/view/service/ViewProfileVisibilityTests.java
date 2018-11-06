package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.assertj.core.api.Condition;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

/**
 * Tests that validate that toggling visibility of profile elements works as intended.
 */
@SuppressWarnings("ALL")
@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileVisibilityTests {

    private ViewProfileService viewProfileService;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    private ViewProfile profileToTest;

    private Condition<ToggleableEntry> enabled = new Condition<ToggleableEntry>() {
        @Override
        public boolean matches(ToggleableEntry value) {
            return value.getEnabled();
        }
    };

    @Before
    public void setUp() {
        profileToTest = new ViewProfile();
        viewProfileService = new ViewProfileService(viewProfileRepository);
    }

    private void addEntry(ProfileEntryType profileEntryType, boolean enabled) {
        switch (profileEntryType) {
            case CAREER:
                profileToTest.getCareers().add(Career.builder().enabled(enabled).build());
                break;
            case EDUCATION:
                profileToTest.getEducations().add(Education.builder().enabled(enabled).build());
                break;
            case KEY_SKILL:
                profileToTest.getKeySkills().add(KeySkill.builder().enabled(enabled).build());
                break;
            case LANGUAGE:
                profileToTest.getLanguages().add(Language.builder().enabled(enabled).build());
                break;
            case PROJECT:
                profileToTest.getProjects().add(Project.builder().enabled(enabled).build());
                break;
            case PROJECT_ROLE:
                profileToTest.getProjectRoles().add(ProjectRole.builder().enabled(enabled).build());
                break;
            case SECTOR:
                profileToTest.getSectors().add(Sector.builder().enabled(enabled).build());
                break;
            case TRAINING:
                profileToTest.getTrainings().add(Training.builder().enabled(enabled).build());
                break;
            case DISPLAY_CATEGORY:
                profileToTest.getDisplayCategories().add(new Category(enabled));
                break;
            case QUALIFICATION:
                profileToTest.getQualifications().add(Qualification.builder().enabled(enabled).build());
                break;
            default:
                fail("Wrong type for switch: " + profileEntryType.name());
        }
    }

    @SuppressWarnings("SameParameterValue")
    private void assertEntrySelected(ProfileEntryType profileEntryType, int index, boolean expected) {
        switch (profileEntryType) {
            case CAREER:
                assertThat(profileToTest.getCareers().get(index).getEnabled()).isEqualTo(expected);
                break;
            case EDUCATION:
                assertThat(profileToTest.getEducations().get(index).getEnabled()).isEqualTo(expected);
                break;
            case KEY_SKILL:
                assertThat(profileToTest.getKeySkills().get(index).getEnabled()).isEqualTo(expected);
                break;
            case LANGUAGE:
                assertThat(profileToTest.getLanguages().get(index).getEnabled()).isEqualTo(expected);
                break;
            case PROJECT:
                assertThat(profileToTest.getProjects().get(index).getEnabled()).isEqualTo(expected);
                break;
            case PROJECT_ROLE:
                assertThat(profileToTest.getProjectRoles().get(index).getEnabled()).isEqualTo(expected);
                break;
            case SECTOR:
                assertThat(profileToTest.getSectors().get(index).getEnabled()).isEqualTo(expected);
                break;
            case TRAINING:
                assertThat(profileToTest.getTrainings().get(index).getEnabled()).isEqualTo(expected);
                break;
            case DISPLAY_CATEGORY:
                assertThat(profileToTest.getDisplayCategories().get(index).getEnabled()).isEqualTo(expected);
                break;
            case QUALIFICATION:
                assertThat(profileToTest.getQualifications().get(index).getEnabled()).isEqualTo(expected);
                break;
            default:
                fail("Wrong type for switch: " + profileEntryType.name());
        }
    }

    private void assertAllEntrisAreEnabled(ProfileEntryType profileEntryType) {
        switch (profileEntryType) {
            case CAREER:
                assertThat(profileToTest.getCareers()).are(enabled);
                break;
            case EDUCATION:
                assertThat(profileToTest.getEducations()).are(enabled);
                break;
            case KEY_SKILL:
                assertThat(profileToTest.getKeySkills()).are(enabled);
                break;
            case LANGUAGE:
                assertThat(profileToTest.getLanguages()).are(enabled);
                break;
            case PROJECT:
                assertThat(profileToTest.getProjects()).are(enabled);
                break;
            case PROJECT_ROLE:
                assertThat(profileToTest.getProjectRoles()).are(enabled);
                break;
            case SECTOR:
                assertThat(profileToTest.getSectors()).are(enabled);
                break;
            case TRAINING:
                assertThat(profileToTest.getTrainings()).are(enabled);
                break;
            case DISPLAY_CATEGORY:
                assertThat(profileToTest.getDisplayCategories()).are(enabled);
                break;
            case QUALIFICATION:
                assertThat(profileToTest.getQualifications()).are(enabled);
                break;
            default:
                fail("Wrong type for switch: " + profileEntryType.name());
        }
    }

    private void assertAllEntriesAreNotEnabled(ProfileEntryType profileEntryType) {
        switch (profileEntryType) {
            case CAREER:
                assertThat(profileToTest.getCareers()).areNot(enabled);
                break;
            case EDUCATION:
                assertThat(profileToTest.getEducations()).areNot(enabled);
                break;
            case KEY_SKILL:
                assertThat(profileToTest.getKeySkills()).areNot(enabled);
                break;
            case LANGUAGE:
                assertThat(profileToTest.getLanguages()).areNot(enabled);
                break;
            case PROJECT:
                assertThat(profileToTest.getProjects()).areNot(enabled);
                break;
            case PROJECT_ROLE:
                assertThat(profileToTest.getProjectRoles()).areNot(enabled);
                break;
            case SECTOR:
                assertThat(profileToTest.getSectors()).areNot(enabled);
                break;
            case TRAINING:
                assertThat(profileToTest.getTrainings()).areNot(enabled);
                break;
            case DISPLAY_CATEGORY:
                assertThat(profileToTest.getDisplayCategories()).areNot(enabled);
                break;
            case QUALIFICATION:
                assertThat(profileToTest.getQualifications()).areNot(enabled);
                break;
            default:
                fail("Wrong type for switch: " + profileEntryType.name());
        }
    }

    private void testEnableEntry(ProfileEntryType profileEntryType) {
        addEntry(profileEntryType, false);
        viewProfileService.setIsEnabled(profileToTest, 0, true, profileEntryType);
        assertEntrySelected(profileEntryType, 0, true);
    }

    private void testDisableEntry(ProfileEntryType profileEntryType) {
        addEntry(profileEntryType, true);
        viewProfileService.setIsEnabled(profileToTest, 0, false, profileEntryType);
        assertEntrySelected(profileEntryType, 0, false);
    }

    @Test
    public void LanguageEntryIsSelectedAfterSelection() {
        testEnableEntry(ProfileEntryType.LANGUAGE);
    }

    @Test
    public void LanguageIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.LANGUAGE);
    }

    @Test
    public void CarrerIsEnabledAfterEnabling() {
        testEnableEntry(ProfileEntryType.CAREER);
    }

    @Test
    public void CarrerIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.CAREER);
    }

    @Test
    public void EducationIsEnabledAfterEnabling() {
        testEnableEntry(ProfileEntryType.EDUCATION);
    }

    @Test
    public void EducationIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.EDUCATION);
    }

    @Test
    public void KeySkillIsEnabledAfterEnabling() {
        testEnableEntry(ProfileEntryType.KEY_SKILL);
    }

    @Test
    public void KeySkillIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.KEY_SKILL);
    }

    @Test
    public void ProjectIsEnabledAfterEnabling() {
        testEnableEntry(ProfileEntryType.PROJECT);
    }

    @Test
    public void ProjectIsDisabledAfterEnabling() {
        testDisableEntry(ProfileEntryType.PROJECT);
    }

    @Test
    public void ProjectRoleIsEnabledAfterEnabling() {
        testEnableEntry(ProfileEntryType.PROJECT_ROLE);
    }

    @Test
    public void ProjectRoleIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.PROJECT_ROLE);
    }

    @Test
    public void SectorIsEnabledAfterEnabling() {
        testEnableEntry(ProfileEntryType.SECTOR);
    }

    @Test
    public void SectorIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.SECTOR);
    }

    @Test
    public void TrainingIsEnabledAfterEnabling() {
        testEnableEntry(ProfileEntryType.TRAINING);
    }

    @Test
    public void TrainingIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.TRAINING);
    }

    @Test
    public void SkillInProfileIsEnabledAfterEnabling() {
        Category category = new Category("root");
        Skill skill = Skill.builder().name("skill").category(category).build();
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(category);

        viewProfileService.setIsEnabledForSkill(viewProfile, skill.getName(), true);
        assertThat(viewProfile.findSkillByName(skill.getName()).get().getEnabled()).isTrue();
    }

    @Test
    public void SkillInProfileIsDisabledAfterDisabling() {
        Category category = new Category("root");
        Category category2 = new Category("root");
        Skill skill = Skill.builder().name("skill").category(category).build();
        Skill skill2 = Skill.builder().name("skill").category(category2).build();
        ViewProfile viewProfile = new ViewProfile();
        // This strange construct may happen due to deserialization from redis
        viewProfile.setRootCategory(category);
        viewProfile.setDisplayCategories(Collections.singletonList(category2));

        viewProfileService.setIsEnabledForSkill(viewProfile, skill.getName(), false);
        assertThat(viewProfile.findSkillByName(skill.getName()).get().getEnabled()).isFalse();
        // make sure this also works for skills in display categories
        Skill skillFromDisplay = viewProfile.getDisplayCategories().stream()
                .map(Category::getSkills)
                .flatMap(skills -> skills.stream())
                .filter(s -> s.getName().equals(skill.getName()))
                .findFirst()
                .orElse(null);
        assertThat(skillFromDisplay).isNotNull();
        assertThat(skillFromDisplay.getEnabled()).isFalse();
    }

    @Test
    public void AllSkillsInProfileAreEnabledAfterEnabling() {
        Category category = new Category("root");
        Skill skill1 = Skill.builder().name("skill").category(category).enabled(false).build();
        Skill skill2 = Skill.builder().name("skil2").category(category).enabled(false).build();
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(category);

        viewProfileService.setIsEnabledForAllSkills(viewProfile, true);
        assertThat(viewProfile.findSkillByName(skill1.getName()).get().getEnabled()).isTrue();
        assertThat(viewProfile.findSkillByName(skill2.getName()).get().getEnabled()).isTrue();
    }


    private void addRoleProjectToProfile(String name, Boolean enabled) {
        ProjectRole role = new ProjectRole(name, enabled);
        Project project = Project.builder().enabled(true).projectRoles(Collections.singletonList(role)).build();
        profileToTest.getProjects().add(project);
    }

    @Test
    public void RoleInProjectIsDisabledAfterDisabling() {
        addRoleProjectToProfile("Role1", true);
        viewProfileService.setRoleInProjectEnabled(profileToTest, 0, 0, true);
        assertThat(profileToTest.getProjects().get(0).getProjectRoles().get(0).getEnabled()).isTrue();
    }

    @Test
    public void RoleInProjectIsEnabledAfterEnabling() {
        addRoleProjectToProfile("Role2", false);
        viewProfileService.setRoleInProjectEnabled(profileToTest, 0, 0, false);
        assertThat(profileToTest.getProjects().get(0).getProjectRoles().get(0).getEnabled()).isFalse();
    }

    private void addSkillProjectToProfile(Boolean enabled) {
        Skill skill = Skill.builder().enabled(enabled).build();
        Project project = Project.builder().enabled(true).skills(Collections.singletonList(skill)).build();
        profileToTest.getProjects().add(project);
    }

    @Test
    public void SkillInProjectIsEnabledAfterEnabling() {
        addSkillProjectToProfile(false);
        viewProfileService.setSkillInProjectEnabled(profileToTest, 0, 0, true);
        assertThat(profileToTest.getProjects().get(0).getSkills().get(0).getEnabled()).isTrue();
    }

    @Test
    public void SkillInProjectIsDisabledAfterDisabling() {
        addSkillProjectToProfile(true);
        viewProfileService.setSkillInProjectEnabled(profileToTest, 0, 0, false);
        assertThat(profileToTest.getProjects().get(0).getSkills().get(0).getEnabled()).isFalse();
    }

    @Test
    public void AllEntriesCanBeDisabledAndEnabled() {
        for (ProfileEntryType profileEntryType : ProfileEntryType.values()) {
            for(int i = 0; i < 5; i++) {
                addEntry(profileEntryType, false);
            }
            viewProfileService.setIsEnabledForAll(profileToTest, profileEntryType, true);
            assertAllEntrisAreEnabled(profileEntryType);

            viewProfileService.setIsEnabledForAll(profileToTest, profileEntryType, false);
            assertAllEntriesAreNotEnabled(profileEntryType);
        }
    }

    @Test
    public void AllSkillsInProjectAreEnabled() {
        Project project = new Project();
        for(int i = 0; i < 5; i++) {
            project.getSkills().add(Skill.builder().enabled(false).build());
        }
        profileToTest.getProjects().add(project);
        viewProfileService.setIsEnabledForAllSkillsInProject(profileToTest,0,  true);
        profileToTest.getProjects().forEach(project1 -> assertThat(project1.getSkills()).are(enabled));

        viewProfileService.setIsEnabledForAllSkillsInProject(profileToTest, 0, false);
        profileToTest.getProjects().forEach(project1 -> assertThat(project1.getSkills()).areNot(enabled));
    }

    @Test
    public void AllRolesInProjectAreEnabled() {
        Project project = new Project();
        for(int i = 0; i < 5; i++) {
            project.getProjectRoles().add(ProjectRole.builder().enabled(false).build());
        }
        profileToTest.getProjects().add(project);
        viewProfileService.setIsEnabledForAllRolesInProject(profileToTest,0, true);
        profileToTest.getProjects().forEach(project1 -> assertThat(project1.getProjectRoles()).are(enabled));

        viewProfileService.setIsEnabledForAllRolesInProject(profileToTest, 0, false);
        profileToTest.getProjects().forEach(project1 -> assertThat(project1.getProjectRoles()).areNot(enabled));
    }



}