package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

/**
 * Tests that validate that toggling visibility of profile elements works as intended.
 */
@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileVisibilityTests {

    private ViewProfileService viewProfileService;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    @MockBean
    private JedisConnectionFactory jedisConnectionFactory;

    private ViewProfile profileToTest;

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
            case SKILL:
                profileToTest.getSkills().add(Skill.builder().enabled(enabled).build());
                break;
            default:
                fail("Wrong type for switch: " + profileEntryType.name());
        }
    }

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
            case SKILL:
                assertThat(profileToTest.getSkills().get(index).getEnabled()).isEqualTo(expected);
                break;
            default:
                fail("Wrong type for switch: " + profileEntryType.name());
        }
    }

    private void testEnableEntry(ProfileEntryType profileEntryType) {
        addEntry(profileEntryType, false);
        viewProfileService.setEntryEnabled(profileToTest, 0, true, profileEntryType);
        assertEntrySelected(profileEntryType, 0, true);
    }

    private void testDisableEntry(ProfileEntryType profileEntryType) {
        addEntry(profileEntryType, true);
        viewProfileService.setEntryEnabled(profileToTest, 0, false, profileEntryType);
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
        testEnableEntry(ProfileEntryType.SKILL);
    }

    @Test
    public void SkillInProfileIsDisabledAfterDisabling() {
        testDisableEntry(ProfileEntryType.SKILL);
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



}