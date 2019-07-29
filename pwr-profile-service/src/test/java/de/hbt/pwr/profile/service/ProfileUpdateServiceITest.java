package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.*;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.apache.logging.log4j.Logger;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.util.ReflectionTestUtils;

import javax.inject.Inject;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.apache.logging.log4j.LogManager.getLogger;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;


@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ProfileUpdateServiceITest {

    @Inject
    private ProfileUpdateService profileUpdateService;

    @Inject
    private NameEntityRepository nameEntityRepository;

    @Inject
    private ProfileEntryDAO profileEntryDAO;

    @Inject
    private SkillRepository skillRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Inject
    private ProfileRepository profileRepository;

    @Inject
    private AdminNotificationRepository adminNotificationRepository;


    private static Logger LOG = getLogger(ProfileUpdateService.class);

    private NameEntity n1 = new NameEntity(null, "1", NameEntityType.LANGUAGE);
    private NameEntity n2 = new NameEntity(null, "2", NameEntityType.LANGUAGE);
    private NameEntity n3 = new NameEntity(null, "3", NameEntityType.LANGUAGE);

    private Skill s1 = new Skill("S1", 2);
    private Skill s2 = new Skill("S2", 3);
    private Skill s3 = new Skill("S3", 4);
    private Skill s4 = new Skill("S4", 3);


    public ProfileUpdateServiceITest() {

    }

    @Before
    public void setUp() {
    }

    public void initTestData() {
        LOG.debug("Initializing test data...");
        n1 = nameEntityRepository.saveAndFlush(n1);
        n2 = nameEntityRepository.saveAndFlush(n2);
        n3 = nameEntityRepository.saveAndFlush(n3);

        s1 = skillRepository.saveAndFlush(s1);
        s2 = skillRepository.saveAndFlush(s2);
        s3 = skillRepository.saveAndFlush(s3);
        s4 = skillRepository.saveAndFlush(s4);

    }

    @Test
    @Transactional
    public void testRemoveInvalidEntriesNoInvalids() {
        initTestData();
        final String methodName = "removeInvalidEntries";
        Set<LanguageSkill> languageSkillSet = new HashSet<>();
        LanguageSkill lang1 = new LanguageSkill(1L, n1, LanguageSkillLevel.ADVANCED);
        LanguageSkill lang2 = new LanguageSkill(2L, n2, LanguageSkillLevel.BASIC);
        LanguageSkill lang3 = new LanguageSkill(3L, n3, LanguageSkillLevel.BUSINESS_FLUENT);
        languageSkillSet.add(lang1);
        languageSkillSet.add(lang2);
        languageSkillSet.add(lang3);
        ReflectionTestUtils.invokeMethod(profileUpdateService, methodName, languageSkillSet);
        assertThat(languageSkillSet.size()).isEqualTo(3);
        assertThat(languageSkillSet).containsExactlyInAnyOrder(lang1, lang2, lang3);
    }




    /**
     * Thats the removal of an invalid {@link ProfileEntry} where an entry
     * does not have a {@link ProfileEntry#getNameEntity()} set.
     */
    @Test
    @Transactional
    public void testRemoveInvalidEntriesMissingNameEntity() {
        initTestData();
        final String methodName = "removeInvalidEntries";
        Set<LanguageSkill> languageSkillSet = new HashSet<>();
        LanguageSkill lang1 = new LanguageSkill(1L, null, LanguageSkillLevel.ADVANCED);
        LanguageSkill lang2 = new LanguageSkill(2L, n2, LanguageSkillLevel.BASIC);
        LanguageSkill lang3 = new LanguageSkill(3L, n3, LanguageSkillLevel.BUSINESS_FLUENT);
        languageSkillSet.add(lang1);
        languageSkillSet.add(lang2);
        languageSkillSet.add(lang3);
        ReflectionTestUtils.invokeMethod(profileUpdateService, methodName, languageSkillSet);
        assertThat(languageSkillSet.size()).isEqualTo(2);
        assertThat(languageSkillSet).containsExactlyInAnyOrder(lang2, lang3);
    }


    /**
     * Tests that duplicates are removed correctly
     */
    @Test
    @Transactional
    public void testRemoveInvalidEntriesDuplicates() {
        initTestData();
        final String methodName = "removeInvalidEntries";
        Set<LanguageSkill> languageSkillSet = new HashSet<>();
        LanguageSkill lang1 = new LanguageSkill(1L, n1, LanguageSkillLevel.ADVANCED);
        LanguageSkill lang2 = new LanguageSkill(2L, n2, LanguageSkillLevel.BASIC);
        LanguageSkill lang3 = new LanguageSkill(3L, n2, LanguageSkillLevel.BUSINESS_FLUENT);
        languageSkillSet.add(lang1);
        languageSkillSet.add(lang2);
        languageSkillSet.add(lang3);
        ReflectionTestUtils.invokeMethod(profileUpdateService, methodName, languageSkillSet);
        assertThat(languageSkillSet.size()).isEqualTo(2);
        assertThat(languageSkillSet).contains(lang1);
        if (languageSkillSet.contains(lang2)) assertThat(languageSkillSet).doesNotContain(lang3);
    }

    /**
     * private Set<? extends ProfileEntry> persistEntries(Set<? extends ProfileEntry> entries)
     * <p>
     * Checks that this works as intended.
     */
    @Test
    @Transactional
    public void testPersistNewEntries() {
        initTestData();
        Set<AdminNotification> adminNotifications = new HashSet<>();
        Profile p = new Profile();
        LanguageSkill lang2 = new LanguageSkill(null, n2, LanguageSkillLevel.BASIC);
        LanguageSkill lang3 = new LanguageSkill(null, n3, LanguageSkillLevel.BUSINESS_FLUENT);
        // The represents a conflict. A NameEntity with "2" is already existing, but the ID is null, meaning
        // it should be newly created.
        Set<LanguageSkill> languageSkillSet = new HashSet<>();
        languageSkillSet.add(lang2);
        languageSkillSet.add(lang3);
        languageSkillSet = ReflectionTestUtils.invokeMethod(profileUpdateService, "persistEntries", languageSkillSet, p, NameEntityType.LANGUAGE,adminNotifications);
        assertThat(languageSkillSet.size()).isEqualTo(2);
    }

    /**
     * private Project importProjectSkills(Project project, Set<Skill> profileSkills
     * <p>
     * Validates that skills in a project are correctly imported(persisted + added to the profile Skills if necessary).
     * This test case hat a skill in the project that is not in the profile
     */
    @Test
    @Transactional
    public void testImportProjectSkills() {
        initTestData();
        Set<AdminNotification> adminNotifications = new HashSet<>();
        Profile profile = new Profile();
        profileRepository.saveAndFlush(profile);
        Set<Skill> profileSkills = new HashSet<>();
        profile.setSkills(profileSkills);
        profileSkills.add(s1);
        profileSkills.add(s2);
        profileSkills.add(s3);

        profileRepository.saveAndFlush(profile);
        Skill s5 = new Skill("S5", 3);
        Set<Skill> projectSkills = new HashSet<>();
        projectSkills.add(s4);
        projectSkills.add(s5);

        Project p = new Project();
        p.setSkills(projectSkills);
        p.setProjectRoles(new HashSet<>());
        p.setClient(new NameEntity("Aldi", NameEntityType.COMPANY));
        p.setBroker(new NameEntity("Aldi", NameEntityType.COMPANY));
        p.setStartDate(LocalDate.now());
        p.setEndDate(LocalDate.now());
        p.setName("Test");
        p.setDescription("This is a test project");

        p = ReflectionTestUtils.invokeMethod(profileUpdateService, "importProjectSkills", profile, p, adminNotifications);
        assertThat(profileSkills.size()).isEqualTo(5);
        Optional<Skill> skillOptional = profileSkills.stream().filter(skill -> skill.getName().equals("S5")).findFirst();
        assertThat(skillOptional).isPresent();
        Skill foundS5 = skillRepository.findByName("S5").get();
        assertThat(foundS5).isNotNull();
        assertThat(foundS5).isEqualTo(skillOptional.get());
    }

    @Test
    @Transactional
    public void testImportProjectSkills_withDuplicate_thenChangeRating() {
        initTestData();
        Profile profile = new Profile();
        profileRepository.saveAndFlush(profile);
        Set<Skill> profileSkills = new HashSet<>();
        profile.setSkills(profileSkills);
        profileSkills.add(s1);
        profileSkills.add(s2);
        profileSkills.add(s3);

        profileRepository.saveAndFlush(profile);
        Skill s5 = new Skill("S5", 3);
        Set<Skill> projectSkills = new HashSet<>();
        projectSkills.add(s1);
        projectSkills.add(s4);
        projectSkills.add(s5);

        Project p = new Project();
        p.setSkills(projectSkills);
        p.setProjectRoles(new HashSet<>());
        p.setClient(new NameEntity("Aldi", NameEntityType.COMPANY));
        p.setBroker(new NameEntity("Aldi", NameEntityType.COMPANY));
        p.setStartDate(LocalDate.now());
        p.setEndDate(LocalDate.now());
        p.setName("Test");
        p.setDescription("This is a test project");

        p = ReflectionTestUtils.invokeMethod(profileUpdateService, "importProjectSkills", profile, p);
        profile = profileUpdateService.updateProfile(profile);

        profile.getSkills().forEach(skill -> skill.setRating(5));
        profile = profileUpdateService.updateProfile(profile);
        profileRepository.saveAndFlush(profile);
        assertThat(profileSkills.size()).isEqualTo(5);
        Optional<Skill> skillOptional = profileSkills.stream().filter(skill -> skill.getName().equals("S5")).findFirst();
        assertThat(skillOptional).isPresent();
        Skill foundS5 = skillRepository.findByName("S5").get();
        assertThat(foundS5).isNotNull();
        assertThat(foundS5).isEqualTo(skillOptional.get());
        assertThat(foundS5.getRating()).isEqualTo(5);
    }

    @Test
    @Transactional
    public void testAddSkillChangeRating(){
        Profile profile = new Profile();
        profileRepository.saveAndFlush(profile);
        Skill mySQL = new Skill("MySQL", 1);
        Skill test = new Skill("test", 1);

        Set<Skill> skillSet = new HashSet<>();
        skillSet.add(test);
        skillSet.add(mySQL);
        profile.setSkills(skillSet);
        profileUpdateService.importProfile(profile);
        profileRepository.saveAndFlush(profile);



        Skill duplicate = new Skill(mySQL.getName(),5);
        profile.getSkills().add(duplicate);

        profile = profileUpdateService.updateProfile(profile);
        profileRepository.saveAndFlush(profile);

        Set<Skill> resultSkills = profileRepository.findById(profile.getId()).get().getSkills();
        assertThat(profile.getSkills().size()).isEqualTo(2);
        Optional<Skill> skillDuplicateOptional =
                resultSkills.stream().filter(skill -> skill.getName().equals(duplicate.getName())).findFirst();
        assertThat(skillDuplicateOptional.isPresent());
        assertThat(skillDuplicateOptional.get().getRating()).isEqualTo(5);

    }

    /**
     * Validates that possible duplicate skills (Profile has skill "foo" with an id, project has skill "foo" without an id)
     * are interpreted correctly
     */
    @Test
    @Transactional
    public void testImportProjectSkillsWithDuplicate() {
        initTestData();
        Set<AdminNotification> adminNotifications = new HashSet<>();
        Profile profile = new Profile();
        Set<Skill> profileSkills = new HashSet<>();
        profile.setSkills(profileSkills);
        profileSkills.add(s1);
        profileSkills.add(s2);
        profileSkills.add(s3);
        profileRepository.saveAndFlush(profile);

        Skill s5 = new Skill("S3", 3);
        Set<Skill> projectSkills = new HashSet<>();
        projectSkills.add(s4);
        projectSkills.add(s5);

        Project p = new Project();
        p.setSkills(projectSkills);
        p.setProjectRoles(new HashSet<>());
        p.setClient(new NameEntity("Aldi", NameEntityType.COMPANY));
        p.setBroker(new NameEntity("Aldi", NameEntityType.COMPANY));
        p.setStartDate(LocalDate.now());
        p.setEndDate(LocalDate.now());
        p.setName("Test");
        p.setDescription("This is a test project");

        p = ReflectionTestUtils.invokeMethod(profileUpdateService, "importProjectSkills", profile, p, adminNotifications);
        assertThat(profileSkills.size()).isEqualTo(4);
        assertThat(profileSkills).containsExactlyInAnyOrder(s1, s2, s3, s4);
        assertThat(p.getSkills()).containsExactlyInAnyOrder(s3, s4);
    }

    /**
     * Tests that 'hidden' duplicates(same name, different technical ID) are found and resolved. No rating conflict.
     * <p>
     * Method signature: private void importProfileSkills(Profile profile)
     */
    @Test
    @Transactional
    public void testImportProfileSkillsWithDuplicates() {
        Set<AdminNotification> adminNotifications = new HashSet<>();
        initTestData();
        Profile p = new Profile();
        Set<Skill> profileSkills = new HashSet<>();
        p.setSkills(profileSkills);
        Skill duplicate = new Skill(s1.getName(), s1.getRating());
        profileSkills.add(s1);
        profileSkills.add(s2);
        profileSkills.add(s3);
        profileSkills.add(duplicate);

        ReflectionTestUtils.invokeMethod(profileUpdateService, "importProfileSkills", p, adminNotifications);
        Set<Skill> resultSkills = p.getSkills();
        assertThat(resultSkills).contains(s2);
        assertThat(resultSkills).contains(s3);
        if (resultSkills.contains(s1)) {
            assertThat(resultSkills).doesNotContain(duplicate);
        } else {
            assertThat(resultSkills).contains(duplicate);
        }
    }


    /**
     * Tests that Skills names are handled case insensitively are found as duplicates and resolved. No rating conflict.
     * <p>
     * Method signature: private void importProfileSkills(Profile profile)
     */
    @Test
    @Transactional
    public void testImportProfileSkillsWithCaseUnsensitiveDuplicates() {
        initTestData();
        Set<AdminNotification> notifications = new HashSet<>();
        Profile p = new Profile();
        Set<Skill> profileSkills = new HashSet<>();
        p.setSkills(profileSkills);
        Skill duplicate = new Skill(s1.getName().toLowerCase(), s1.getRating() + 1);
        profileSkills.add(s1);
        profileSkills.add(s2);
        profileSkills.add(s3);
        profileSkills.add(duplicate);

        ReflectionTestUtils.invokeMethod(profileUpdateService, "importProfileSkills", p, notifications);
        Set<Skill> resultSkills = p.getSkills();
        assertThat(resultSkills).contains(s2);
        assertThat(resultSkills).contains(s3);
        if (resultSkills.contains(s1)) {
            assertThat(resultSkills).doesNotContain(duplicate);
        } else {
            assertThat(resultSkills).contains(duplicate);
        }
    }

    /**
     * Tests the skill import with a conflict in skill level. The higher skill level has to
     * remain
     */
    @Test
    @Transactional
    public void testImportProfileSkillsWithDuplicateRatingConflict() {
        initTestData();
        Set<AdminNotification> adminNotifications = new HashSet<>();
        Profile p = new Profile();
        Set<Skill> profileSkills = new HashSet<>();
        p.setSkills(profileSkills);
        int highRating = 5;
        Skill duplicate = new Skill(s1.getName(), highRating);
        profileSkills.add(s1);
        profileSkills.add(s2);
        profileSkills.add(s3);
        profileSkills.add(duplicate);

        ReflectionTestUtils.invokeMethod(profileUpdateService, "importProfileSkills", p, adminNotifications);
        Set<Skill> resultSkills = p.getSkills();
        assertThat(resultSkills.size()).isEqualTo(3);
        assertThat(resultSkills).contains(s2);
        assertThat(resultSkills).contains(s3);
        Optional<Skill> skillDuplicateOptional =
                resultSkills.stream().filter(skill -> skill.getName().equals(duplicate.getName())).findFirst();
        assertThat(skillDuplicateOptional.isPresent());
        assertThat(skillDuplicateOptional.get().getRating()).isEqualTo(highRating);
    }

    /**
     * Validates that new skills in project and profiles won't result in duplicates.
     */
    @Test
    @Transactional
    public void testImportProfileSkillsWithNewSkill() {
        Profile p = new Profile();
        Skill java = new Skill("Java", 2);
        Skill confluence = new Skill("Confluence", 2);
        Skill jira = new Skill("Jira", 3);
        Skill jiraClone = new Skill("Jira", 3);
        p.getSkills().add(java);
        p.getSkills().add(confluence);
        p.getSkills().add(jira);
        p.getSkills().add(jiraClone);

        Project project1 = new Project();
        Skill react = new Skill("React", 1);
        Skill webpack = new Skill("Webpack", 3);
        Skill jira_p1 = new Skill("Jira", 3);
        project1.getSkills().add(react);
        project1.getSkills().add(webpack);
        project1.getSkills().add(jira_p1);

        p.getProjects().add(project1);

        profileUpdateService.importProfile(p);

        assertThat(p.getSkills()).containsExactlyInAnyOrder(java, confluence, jira, react, webpack);
        assertThat(p.getSkills()).containsOnly(java, confluence, jira, react, webpack);

        Skill jiraClone2 = new Skill("Jira", 3);
        Skill jiraCloneDifferentRating = new Skill("Jira", 4);
        Project project2 = new Project();
        project2.getSkills().add(jiraClone2);
        p.getProjects().add(project2);
        assertThat(p.getSkills()).containsExactlyInAnyOrder(java, confluence, jira, react, webpack);
        assertThat(p.getSkills()).containsOnly(java, confluence, jira, react, webpack);
    }

    @Test
    @Transactional
    public void testImportDefaultProfile() {
        Profile p = new Profile();
        p = profileRepository.saveAndFlush(p);

        profileUpdateService.importProfile(p);
        assertThat(profileRepository.findAll()).isNotEmpty();

    }


    private <T extends ProfileEntry> void assertContainsEntryWithName(Set<T> entries, NameEntity nameEntity) {
        Optional<T> optional = entries.stream().filter(t -> t.getNameEntity().getName().equals(nameEntity.getName())).findAny();
        if (!optional.isPresent()) {
            fail("Expected " + entries + " to contain a " + ProfileEntry.class.getSimpleName() + " that has " + nameEntity);
        }
    }

    private void assertContains(List<SkillNotification> notifications, Skill skill) {
        Optional<SkillNotification> notificationOptional = notifications
                .stream()
                .filter(skillNotification -> skillNotification.getSkill().equals(skill))
                .findAny();
        if (!notificationOptional.isPresent()) {
            fail("Expected " + notifications + " to contain a " + SkillNotification.class.getSimpleName() + " that has " + skill);
        }
    }

    private void assertContains(List<ProfileEntryNotification> notifications, NameEntity nameEntity) {
        Optional<ProfileEntryNotification> notificationOptional = notifications
                .stream()
                .filter(notification -> notification.getNameEntity().equals(nameEntity))
                .findAny();
        if (!notificationOptional.isPresent()) {
            fail("Expected " + notifications + " to contain a " + ProfileEntryNotification.class.getSimpleName() + " that has " + nameEntity);
        }
    }

    /**
     * Tests import a valid profile that only has new entries.
     * Validates that:
     * A) The entries all get persisted correctly (have an ID, are in the database)
     * B) The name entites get peristed correctly
     * C) Potential conflicts get resolved correctly
     * D) Notifications are created when necessary
     * => Full integrative testing of the profile import
     */
    @Test
    public void testImportValidProfileWithNewProfiles() {
        Profile profile = new Profile();
        profile = profileRepository.saveAndFlush(profile);

        Skill skill1 = new Skill("Skill1", 4);
        Skill skill2 = new Skill("Skill2", 2);
        Skill skill3 = new Skill("Skill3", 2);
        profile.getSkills().add(skill1);
        profile.getSkills().add(skill2);
        profile.getSkills().add(skill3);

        EducationEntry educationEntry1 = new EducationEntry(new NameEntity("Education1", NameEntityType.EDUCATION), "TestDegree");
        EducationEntry educationEntry2 = new EducationEntry(new NameEntity("Education2", NameEntityType.EDUCATION), "TestDegree2");
        profile.getEducation().add(educationEntry1);
        profile.getEducation().add(educationEntry2);

        SectorEntry sectorEntry1 = new SectorEntry(new NameEntity("Sector1", NameEntityType.SECTOR));
        SectorEntry sectorEntry2 = new SectorEntry(new NameEntity("Sector2", NameEntityType.SECTOR));
        profile.getSectors().add(sectorEntry1);
        profile.getSectors().add(sectorEntry2);

        KeySkillEntry keySkillEntry1 = new KeySkillEntry(new NameEntity("KeySkill1", NameEntityType.KEY_SKILL));
        KeySkillEntry keySkillEntry2 = new KeySkillEntry(new NameEntity("KeySkill2", NameEntityType.KEY_SKILL));
        KeySkillEntry keySkillEntry3 = new KeySkillEntry(new NameEntity("KeySkill3", NameEntityType.KEY_SKILL));
        profile.getKeySkillEntries().add(keySkillEntry1);
        profile.getKeySkillEntries().add(keySkillEntry2);
        profile.getKeySkillEntries().add(keySkillEntry3);

        CareerEntry careerEntry1 = new CareerEntry(new NameEntity("Carreer1", NameEntityType.CAREER), LocalDate.now(), null);
        CareerEntry careerEntry2 = new CareerEntry(new NameEntity("Carreer2", NameEntityType.CAREER), LocalDate.now(), null);
        profile.getCareerEntries().add(careerEntry1);
        profile.getCareerEntries().add(careerEntry2);

        TrainingEntry trainingEntry1 = new TrainingEntry(new NameEntity("Training1", NameEntityType.TRAINING), LocalDate.now(), LocalDate.now());
        TrainingEntry trainingEntry2 = new TrainingEntry(new NameEntity("Training2", NameEntityType.TRAINING), LocalDate.now(), LocalDate.now());
        profile.getTrainingEntries().add(trainingEntry1);
        profile.getTrainingEntries().add(trainingEntry2);

        QualificationEntry qualificationEntry1 = new QualificationEntry(new NameEntity("Qualification1", NameEntityType.QUALIFICATION), LocalDate.now());
        QualificationEntry qualificationEntry2 = new QualificationEntry(new NameEntity("Qualification2", NameEntityType.QUALIFICATION), LocalDate.now());
        profile.getQualification().add(qualificationEntry1);
        profile.getQualification().add(qualificationEntry2);

        LanguageSkill languageSkill1 = new LanguageSkill(new NameEntity("Language1", NameEntityType.LANGUAGE), LanguageSkillLevel.BASIC);
        LanguageSkill languageSkill2 = new LanguageSkill(new NameEntity("Client1", NameEntityType.LANGUAGE), LanguageSkillLevel.ADVANCED);
        profile.getLanguages().add(languageSkill1);
        profile.getLanguages().add(languageSkill2);

        Project project = new Project();
        project.setName("Project1");
        project.getSkills().add(skill1);
        project.getSkills().add(skill2);
        project.setClient(new NameEntity("Client1", NameEntityType.COMPANY));
        project.setBroker(new NameEntity("Client1", NameEntityType.COMPANY));
        project.setDescription("Description");
        project.setProjectRoles(new HashSet<>(Collections.singletonList(new NameEntity("Role1", NameEntityType.PROJECT_ROLE))));

        profile.getProjects().add(project);

        profile = profileUpdateService.updateProfile(profile);

        assertThat(profile.getLastEdited()).isBeforeOrEqualTo(LocalDateTime.now());

        assertContainsEntryWithName(profile.getEducation(), educationEntry1.getNameEntity());
        assertContainsEntryWithName(profile.getEducation(), educationEntry2.getNameEntity());

        assertContainsEntryWithName(profile.getSectors(), sectorEntry1.getNameEntity());
        assertContainsEntryWithName(profile.getSectors(), sectorEntry2.getNameEntity());

        assertContainsEntryWithName(profile.getKeySkillEntries(), keySkillEntry1.getNameEntity());
        assertContainsEntryWithName(profile.getKeySkillEntries(), keySkillEntry2.getNameEntity());
        assertContainsEntryWithName(profile.getKeySkillEntries(), keySkillEntry3.getNameEntity());

        assertContainsEntryWithName(profile.getCareerEntries(), careerEntry1.getNameEntity());
        assertContainsEntryWithName(profile.getCareerEntries(), careerEntry2.getNameEntity());

        assertContainsEntryWithName(profile.getTrainingEntries(), trainingEntry1.getNameEntity());
        assertContainsEntryWithName(profile.getTrainingEntries(), trainingEntry2.getNameEntity());

        assertContainsEntryWithName(profile.getQualification(), qualificationEntry1.getNameEntity());
        assertContainsEntryWithName(profile.getQualification(), qualificationEntry2.getNameEntity());

        assertContainsEntryWithName(profile.getLanguages(), languageSkill1.getNameEntity());
        assertContainsEntryWithName(profile.getLanguages(), languageSkill2.getNameEntity());

        assertThat(profile.getProjects()).isNotEmpty();

        Project retrievedProject = (Project) profile.getProjects().toArray()[0];
        assertThat(retrievedProject.getName()).isEqualTo("Project1");
        assertThat(retrievedProject.getSkills()).containsExactlyInAnyOrder(skill1, skill2);
        assertThat(retrievedProject.getClient()).isEqualTo(retrievedProject.getBroker());
        assertThat(retrievedProject.getClient().getName()).isEqualTo("Client1");
        assertThat(retrievedProject.getClient().getType()).isEqualTo(NameEntityType.COMPANY);
        assertThat(retrievedProject.getClient().getId()).isNotNull();
        assertThat(retrievedProject.getDescription()).isEqualTo("Description");

        assertThat(profile.getSkills()).containsExactlyInAnyOrder(skill1, skill2, skill3);

        List<SkillNotification> skillNotifications = adminNotificationRepository.findAllByAdminNotificationStatus(AdminNotificationStatus.ALIVE)
                .stream()
                .filter(notification -> notification.getNotificationType().equals("SkillNotification"))
                .map(notification -> (SkillNotification) notification)
                .collect(Collectors.toList());
        assertContains(skillNotifications, skill1);
        assertContains(skillNotifications, skill2);
        assertContains(skillNotifications, skill3);

        List<ProfileEntryNotification> profileEntryNotifications = adminNotificationRepository.findAllByAdminNotificationStatus(AdminNotificationStatus.ALIVE)
                .stream()
                .filter(notification -> notification.getNotificationType().equals("ProfileEntryNotification"))
                .map(notification -> (ProfileEntryNotification) notification)
                .collect(Collectors.toList());
        assertContains(profileEntryNotifications, educationEntry1.getNameEntity());
        assertContains(profileEntryNotifications, educationEntry2.getNameEntity());

        assertContains(profileEntryNotifications, sectorEntry1.getNameEntity());
        assertContains(profileEntryNotifications, sectorEntry2.getNameEntity());

        assertContains(profileEntryNotifications, keySkillEntry1.getNameEntity());
        assertContains(profileEntryNotifications, keySkillEntry2.getNameEntity());
        assertContains(profileEntryNotifications, keySkillEntry3.getNameEntity());

        assertContains(profileEntryNotifications, careerEntry1.getNameEntity());
        assertContains(profileEntryNotifications, careerEntry2.getNameEntity());

        assertContains(profileEntryNotifications, trainingEntry1.getNameEntity());
        assertContains(profileEntryNotifications, trainingEntry2.getNameEntity());

        assertContains(profileEntryNotifications, qualificationEntry1.getNameEntity());
        assertContains(profileEntryNotifications, qualificationEntry2.getNameEntity());

        assertContains(profileEntryNotifications, languageSkill1.getNameEntity());
        assertContains(profileEntryNotifications, languageSkill2.getNameEntity());

        List<ProfileUpdatedNotification> profileUpdatedNotifications = adminNotificationRepository.findAllByAdminNotificationStatus(AdminNotificationStatus.ALIVE)
                .stream()
                .filter(notification -> notification.getNotificationType().equals("ProfileUpdatedNotification"))
                .map(notification -> (ProfileUpdatedNotification) notification)
                .collect(Collectors.toList());
        assertThat(profileUpdatedNotifications).isNotEmpty();

        Profile retrieved = profileRepository.findById(profile.getId()).get();
        assertThat(retrieved).isNotNull();

    }
}