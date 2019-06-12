package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.data.ProfileEntryDAO;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.data.SkillRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.util.Optional;

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

    @Before
    public void setUp() throws Exception {

        profileEntryDAO = mock(ProfileEntryDAO.class);
        nameEntityRepository = mock(NameEntityRepository.class);
        profileRepository = mock(ProfileRepository.class);
        skillRepository = mock(SkillRepository.class);

        when(nameEntityRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        when(skillRepository.save(any())).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        profileUpdateService = new ProfileUpdateService(nameEntityRepository, skillRepository, profileEntryDAO, null, profileRepository, null, null);
        profileEntryService = new ProfileEntryService(nameEntityRepository, profileEntryDAO, profileRepository, skillRepository);
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

    private <T extends ProfileEntry> T profileEntryUpdate(final T skill) {
        when(profileEntryDAO.update(eq(skill))).thenReturn(skill);
        return null;
    }

    private void skillExisting(Long id, String name, int rating) {
        when(skillRepository.findByName(name)).thenReturn(Optional.of(Skill.builder().name(name).id(id).rating(rating).build()));
    }

    @Test
    public void shouldAddLanguageToProfile() {
        Profile profile = new Profile();
        LanguageSkill language = LanguageSkill.builder().level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
        profileEntryUpdate(language);
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
        LanguageSkill language = LanguageSkill.builder().level(LanguageSkillLevel.ADVANCED).language(NameEntity.builder().name("Deutsch").type(NameEntityType.LANGUAGE).build()).build();
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
        profileEntryUpdate(trainingEntry);
        TrainingEntry result = (TrainingEntry) profileEntryService.updateProfileEntry(trainingEntry, profile, NameEntityType.TRAINING);
        assertThat(profile.getTrainingEntries()).containsExactly(trainingEntry);
    }


    @Test
    public void shouldAddSkillToProfile() {
        skillExisting(34L,"skill",3);
        Profile p = new Profile();
        Skill s = Skill.builder().id(34L).name("skill").rating(3).build();
        profileEntryService.updateSkill(s, p);
        assertThat(p.getSkills()).containsExactly(s);
    }

    @Test
    public void shouldAddSkillOnceToProfile() {
        skillExisting(190L,"skill",3);
        Profile p = new Profile();
        Skill s = Skill.builder().id(190L).name("skill").rating(3).build();
        profileEntryService.updateSkill(s, p);
        profileEntryService.updateSkill(s, p);
        assertThat(p.getSkills()).containsExactly(s);
    }


    // update rating
    @Test
    public void shouldUpdateSkillRating_whenNewRatingHigher() {
        skillExisting(190L,"skillo",3);
        skillExisting(190L,"skillo",4);
        Profile p = new Profile();
        Skill s = Skill.builder().id(190L).name("skillo").rating(3).build();
        Skill ex = Skill.builder().id(190L).name("skillo").rating(4).build();
        profileEntryService.updateSkill(s, p);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);
        profileEntryService.updateSkill(ex, p);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);

    }

    @Test
    public void shouldNotUpdateSkillRating_whenNewRatingLower() {
        skillExisting(190L,"skillo",4);
        skillExisting(190L,"skillo",3);
        Profile p = new Profile();
        Skill s = Skill.builder().id(190L).name("skillo").rating(4).build();
        Skill ex = Skill.builder().id(190L).name("skillo").rating(3).build();
        profileEntryService.updateSkill(s, p);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);
        skillExisting(190L,"skillo",3);
        assertThat(p.getSkills()).containsExactly(s);
        assertThat(p.getSkills().size()).isEqualTo(1);
    }


    @Test
    public void shouldDeleteSkill_whenExisting() {
        skillExisting(8L,"skillOne",1);
        Profile p = new Profile();
        Skill s1 = Skill.builder().id(8L).name("skillOne").rating(1).build();
        Skill db = profileEntryService.updateSkill(s1, p);
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
    public void shouldAddProjectToProfile(){
        Profile p = new Profile();
        Project project = Project.builder().name("ProjectName").build();
        profileEntryService.updateProject(project,p);
        assertThat(p.getProjects()).containsExactly(project);
    }
}