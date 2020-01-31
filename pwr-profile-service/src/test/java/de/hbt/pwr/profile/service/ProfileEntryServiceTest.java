package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class ProfileEntryServiceTest {

    private ProfileEntryService profileEntryService;

    private ProfileEntryDAO profileEntryDAO;
    private ProfileRepository profileRepository;
    private NameEntityRepository nameEntityRepository;
    private ProfileUpdateService profileUpdateService;
    private SkillRepository skillRepository;
    private ProjectRepository projectRepository;
    private SkillProfileClient skillProfileClient;

    @Before
    public void setUp() throws Exception {

        profileEntryDAO = mock(ProfileEntryDAO.class);
        nameEntityRepository = mock(NameEntityRepository.class);
        profileRepository = mock(ProfileRepository.class);
        skillRepository = mock(SkillRepository.class);
        projectRepository = mock(ProjectRepository.class);
        skillProfileClient = mock(SkillProfileClient.class);


        when(nameEntityRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        when(skillRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        when(projectRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        profileUpdateService = new ProfileUpdateService(nameEntityRepository, skillRepository, profileEntryDAO, projectRepository, profileRepository, null, null);
        profileEntryService = new ProfileEntryService(nameEntityRepository, profileEntryDAO, profileRepository, skillRepository, projectRepository, skillProfileClient);
    }


    private void noNameEntityExisting(String name, NameEntityType type) {
        when(nameEntityRepository.findByNameAndType(eq(name), eq(type)))
                .thenReturn(null);
    }

    private void nameEntityExisting(Long id, String name, NameEntityType type) {
        when(nameEntityRepository.findByNameAndType(eq(name), eq(type)))
                .thenReturn(NameEntity.builder().id(id).name(name).type(type).build());
    }

    private <T extends ProfileEntry> T profileEntryExisting(ProfileEntry profileEntry, final Class<T> clazz) {
        when(profileEntryDAO.find(eq(profileEntry.getId()), eq(clazz))).thenReturn((T) profileEntry);
        return null;
    }

    private <T extends ProfileEntry> T profileEntryUpdate(final T entry) {
        when(profileEntryDAO.update(eq(entry))).thenReturn(entry);
        return null;
    }

    private <T extends ProfileEntry> T profileEntryPersist(final T entry) {
        when(profileEntryDAO.persist(eq(entry))).thenReturn(entry);
        return null;
    }

    private void skillExisting(Long id, String name, int rating) {
        when(skillRepository.findByName(name)).thenReturn(Optional.of(Skill.builder().name(name).id(id).rating(rating).build()));
    }

    private void projectExisting(Long id, String name) {
        when(projectRepository.findById(id)).thenReturn(Optional.of(Project.builder().id(id).name(name).build()));
    }

    private void projectExisting(Long id, Project p) {
        when(projectRepository.findById(id)).thenReturn(Optional.of(p));
    }

    private void savingProject(Project project, Long id) {
        Project answerer = project.copyNullId();
        answerer.setId(id);
        when(projectRepository.save(project)).thenReturn(answerer);
    }

    @Test
    public void shouldAddLanguageToProfile() {
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        profileEntryUpdate(language);
        profileEntryPersist(language);
        LanguageSkill result = (LanguageSkill) profileEntryService.updateProfileEntry(language, profile, NameEntityType.LANGUAGE);
        assertThat(profile.getLanguages()).containsExactly(language);
    }

    @Test
    public void shouldAddLanguageToProfile_andPersistLanguageSkill() {
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        profileEntryUpdate(language);
        LanguageSkill result = (LanguageSkill) profileEntryService.updateProfileEntry(language, profile, NameEntityType.LANGUAGE);
        verify(profileEntryDAO, times(1)).persist(language);
    }

    @Test
    public void shouldNotPersistLanguage_idAlreadySet() {
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().id(15235L).level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        profileEntryUpdate(language);
        LanguageSkill result = (LanguageSkill) profileEntryService.updateProfileEntry(language, profile, NameEntityType.LANGUAGE);
        verify(profileEntryDAO, times(1)).update(language);
    }

    @Test
    public void shouldAddNameEntity_whenNotExisting() {
        noNameEntityExisting("Deutsch", NameEntityType.LANGUAGE);
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        profileEntryUpdate(language);
        LanguageSkill result = (LanguageSkill) profileEntryService.updateProfileEntry(language, profile, NameEntityType.LANGUAGE);
        verify(nameEntityRepository, times(1)).save(language.getNameEntity());
    }

    @Test
    public void shouldReplaceNameEntityWithExistingOne() {
        nameEntityExisting(5959L, "Deutsch", NameEntityType.LANGUAGE);
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().id(222L).level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().id(5959L).name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        profileEntryUpdate(language);
        LanguageSkill result = (LanguageSkill) profileEntryService.updateProfileEntry(language, profile, NameEntityType.LANGUAGE);
        verify(nameEntityRepository, times(0)).save(language.getNameEntity());
        assertThat(profile.getLanguages())
                .extracting(languageSkill -> languageSkill.getNameEntity().getId())
                .containsExactly(5959L);
    }

    @Test
    public void shouldDeleteLanguageSkill_WhenExisting() {
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().id(550L).level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        profileEntryExisting(language, LanguageSkill.class);
        profile.getLanguages().add(language);
        profileEntryService.deleteEntryWithId(550L, profile, NameEntityType.LANGUAGE);
        assertThat(profile.getLanguages().size()).isEqualTo(0);
    }

    @Test
    public void shouldNotDeleteLanguageSkill_WhenNotExisting() {
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().id(44L).level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        LanguageSkill deleteLevel = LanguageSkill.builder().id(543L).level(LanguageSkillLevel.BASIC).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        LanguageSkill deleteName = LanguageSkill.builder().id(123L).level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Schwedisch").type(NameEntityType.LANGUAGE).build()).build();
        profile.getLanguages().add(language);
        profileEntryService.deleteEntryWithId(deleteLevel.getId(), profile, NameEntityType.LANGUAGE);
        profileEntryService.deleteEntryWithId(deleteName.getId(), profile, NameEntityType.LANGUAGE);
        assertThat(profile.getLanguages().size()).isEqualTo(1);
    }


    @Test
    public void shouldAddTrainingToProfile() {
        Profile profile = new Profile();
        NameEntity nameEntity = NameEntity.builder().name("Training").type(NameEntityType.TRAINING).build();
        TrainingEntry trainingEntry = TrainingEntry.builder().startDate(LocalDate.of(2019, 1, 1)).endDate(LocalDate.of(2019, 1, 2)).training(nameEntity).build();
        profileEntryPersist(trainingEntry);
        profileEntryUpdate(trainingEntry);
        TrainingEntry result = (TrainingEntry) profileEntryService.updateProfileEntry(trainingEntry, profile, NameEntityType.TRAINING);
        assertThat(profile.getTrainingEntries()).containsExactly(trainingEntry);
    }


    @Test
    public void shouldAddSkillToProfile() {
        skillExisting(34L, "skill", 3);
        Profile p = new Profile();
        Skill s = Skill.builder().id(34L).name("skill").rating(3).build();
        profileEntryService.updateProfileSkills(s, p);
        assertThat(p.getSkills()).containsExactly(s);
    }

    @Test
    public void shouldAddSkillOnceToProfile() {
        skillExisting(190L, "skill", 3);
        Profile p = new Profile();
        Skill s = Skill.builder().id(190L).name("skill").rating(3).build();
        profileEntryService.updateProfileSkills(s, p);
        profileEntryService.updateProfileSkills(s, p);
        assertThat(p.getSkills()).containsExactly(s);
    }


    // update rating
    @Test
    public void shouldUpdateSkillRating_whenNewRatingHigher() {
        skillExisting(190L, "skillo", 3);
        skillExisting(190L, "skillo", 4);
        Profile p = new Profile();
        Skill s = Skill.builder().id(190L).name("skillo").rating(3).build();
        Skill ex = Skill.builder().id(190L).name("skillo").rating(4).build();
        profileEntryService.updateProfileSkills(s, p);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);
        profileEntryService.updateProfileSkills(ex, p);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);

    }

    @Test
    public void shouldNotUpdateSkillRating_whenNewRatingLower() {
        skillExisting(190L, "skillo", 4);
        skillExisting(190L, "skillo", 3);
        Profile p = new Profile();
        Skill s = Skill.builder().id(190L).name("skillo").rating(4).build();
        Skill ex = Skill.builder().id(190L).name("skillo").rating(3).build();
        profileEntryService.updateProfileSkills(s, p);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);
        skillExisting(190L, "skillo", 3);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);
    }


    @Test
    public void shouldDeleteSkill_whenExisting() {
        skillExisting(8L, "skillOne", 1);
        Profile p = new Profile();
        Skill s1 = Skill.builder().id(8L).name("skillOne").rating(1).build();
        Skill db = profileEntryService.updateProfileSkills(s1, p);
        assertThat(db).isNotNull();
        assertThat(p.getSkills()).containsExactly(db);

        profileEntryService.deleteSkill(db.getId(), p);

        assertThat(p.getSkills().size()).isEqualTo(0);
        assertThat(p.getSkills()).doesNotContain(s1);
    }

    @Test(expected = WebApplicationException.class)
    public void shouldThrowError_whenDeleteSkill_whenNotExisting() {
        Profile p = new Profile();
        profileEntryService.deleteSkill(56L, p);
        assertThat(p.getSkills().size()).isEqualTo(0);
    }

    @Test
    public void shouldAddProjectToProfile() {
        Profile p = new Profile();
        Project project = new Project().toBuilder().name("ProjectName").projectRoles(new HashSet<>()).build();
        profileEntryService.updateProject(project, p);
        assertThat(p.getProjects()).containsExactly(project);
    }

    @Test
    public void shouldDeleteProjectFromProfile() {
        projectExisting(17L, "ProjectName");

        Profile p = new Profile();
        Project project = new Project().toBuilder().id(null).name("ProjectName").projectRoles(new HashSet<>()).build();
        savingProject(project, 17L);
        project = profileEntryService.updateProject(project, p);
        assertThat(p.getProjects()).containsExactly(project);

        profileEntryService.deleteProject(17L, p);
        assertThat(p.getProjects().size()).isEqualTo(0);

    }

    @Test
    public void shouldUpdateBrokerName() {
        Project project = new Project().toBuilder().id(null).name("test").projectRoles(new HashSet<>()).broker(NameEntity.builder().id(100L).name("hans").type(NameEntityType.COMPANY).build()).build();
        projectExisting(11L, project);
        nameEntityExisting(100L, "hans", NameEntityType.COMPANY);
        Profile p = new Profile();
        project = profileEntryService.updateProject(project, p);
        project.setId(11L);
        assertThat(p.getProjects().size()).isEqualTo(1);
        NameEntity ne = NameEntity.builder().id(913L).name("lop").type(NameEntityType.COMPANY).build();
        project.setBroker(ne);
        profileEntryService.updateProject(project, p);
        assertThat(p.getProjects().size()).isEqualTo(1);
        assertThat(p.getProjects()).extracting(Project::getBroker).contains(ne);
    }


    @Test
    public void shouldAddProjectRoleToSet() {
        Project project = new Project().toBuilder().id(null).name("test").projectRoles(new HashSet<>()).build();
        NameEntity ne = NameEntity.builder().name("hans").id(100L).type(NameEntityType.PROJECT_ROLE).build();
        project.getProjectRoles().add(ne);
        projectExisting(11L, project);
        nameEntityExisting(100L, "hans", NameEntityType.PROJECT_ROLE);
        Profile p = new Profile();
        project = profileEntryService.updateProject(project, p);
        project.setId(11L);
        assertThat(p.getProjects().iterator().next().getProjectRoles().size()).isEqualTo(1);
        project.getProjectRoles().add(ne);
        project = profileEntryService.updateProject(project, p);
        assertThat(p.getProjects().iterator().next().getProjectRoles().size()).isEqualTo(1);
    }

    @Test
    public void shouldDeleteProjectRoleToSet() {
        Project project = new Project().toBuilder().id(null).name("test").projectRoles(new HashSet<>()).build();
        NameEntity ne = NameEntity.builder().name("hans").id(100L).type(NameEntityType.PROJECT_ROLE).build();
        project.getProjectRoles().add(ne);
        projectExisting(11L, project);
        nameEntityExisting(100L, "hans", NameEntityType.PROJECT_ROLE);
        Profile p = new Profile();
        project = profileEntryService.updateProject(project, p);
        project.setId(11L);
        assertThat(p.getProjects().iterator().next().getProjectRoles().size()).isEqualTo(1);
        project.getProjectRoles().clear();
        project = profileEntryService.updateProject(project, p);
        assertThat(p.getProjects().iterator().next().getProjectRoles().size()).isEqualTo(0);
    }

    @Test
    public void shouldAddProjectSkillsToProfile() {
        Project project = Project.builder().id(null).name("project").skills(new HashSet<>()).build();
        Skill s1 = Skill.builder().id(189L).rating(3).name("S1").build();
        project.getSkills().add(s1);

        Profile p = Profile.empty();
        profileEntryService.updateProject(project, p);

        assertThat(p.getProjects().size()).isEqualTo(1);
        assertThat(p.getSkills().size()).isEqualTo(1);
        assertThat(p.getSkills().iterator().next()).isEqualTo(s1);
    }

    @Test
    public void shouldPersistASkillOnlyOnce() {
        Skill s1 = Skill.builder().id(null).name("S1").rating(3).build();
        Profile p = new Profile();
        Project project = new Project();
        project.getSkills().add(s1);
        profileEntryService.updateProfileSkills(s1, p);
        profileEntryService.updateProject(project, p);
    }

    @Test
    public void shouldUpdateCategory_forNewSkill() {
        Skill skill = Skill.builder().name("Test").rating(2).build();

        profileEntryService.updateProfileSkills(skill, new Profile());
        Mockito.verify(skillProfileClient, times(1)).updateAndGetCategory("Test");
    }

    @Test
    public void shouldUpdateCategory_forEachSkill() {
        Project project = Project.builder()
                .name("FOOO")
                .skills(new HashSet<>(Arrays.asList(
                        Skill.builder().name("Test").rating(2).build()
                )))
                .build();
        profileEntryService.updateProject(project, new Profile());
        Mockito.verify(skillProfileClient, times(1)).updateAndGetCategory("Test");
    }

    @Test
    public void shouldUpdateOnlySkills_thatAreNotYetInTheProfile() {
        Skill skillA = Skill.builder().id(new Long(1)).name("Skill A").rating(2).build();
        Skill skillB = Skill.builder().id(new Long(2)).name("Skill B").rating(2).build();

        Profile profile = new Profile();
        profile.getSkills().add(skillA);

        Project project = new Project().toBuilder()
                .name("Test")
                .skills(new HashSet<>(Arrays.asList(skillA, skillB)))
                .build();


        profileEntryService.updateProject(project, profile);
        Mockito.verify(skillProfileClient, times(1)).updateAndGetCategory("Skill B");
        Mockito.verify(skillProfileClient, never()).updateAndGetCategory("Skill A");
    }

    // TODO Skill löschen wenn er im Project enthalten ist ?!!?
}