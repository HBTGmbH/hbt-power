package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.data.*;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.*;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.LanguageSkill;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.model.skill.SkillCategory;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.util.ReflectionTestUtils;

import javax.transaction.Transactional;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.any;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AdminNotificationServiceTest extends AbstractIntegrationTest {

    @Autowired
    private SkillRepository skillRepository;
    @Autowired
    private ProfileRepository profileRepository;
    @Autowired
    private NameEntityRepository nameEntityRepository;
    @Autowired
    private ProfileEntryDAO profileEntryDAO;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private AdminNotificationRepository adminNotificationRepository;
    @Autowired
    private ProfileValidationService profileValidationService;

    private AdminNotificationService adminNotificationService;

    private ProfileUpdateService profileUpdateService;


    @Before
    public void setUp() {
        adminNotificationService = new AdminNotificationService(adminNotificationRepository, nameEntityRepository,
                profileEntryDAO, profileRepository, skillRepository, skillProfileClient, null);
        profileUpdateService = new ProfileUpdateService(nameEntityRepository, skillRepository, profileEntryDAO, projectRepository,
                profileRepository, adminNotificationService, profileValidationService);
        given(skillProfileClient.updateAndGetCategory(any())).willReturn(new SkillCategory());
    }

    private Skill newSkill(String name, Integer level) {
        return skillRepository.saveAndFlush(new Skill(name, level));
    }

    /**
     * Validates that the deletion of similar skills works for a single profile, where
     * the skill is used in the profile and a project.
     *
     * @throws Exception bla bla
     */
    @Test
    @Transactional
    public void deleteAllSimilarSkillsSingleProfile() throws Exception {
        Skill keep1 = new Skill("Keep1", 1);
        Skill keep2 = new Skill("Keep2", 2);
        Skill delete1 = new Skill("Delete1", 1);


        keep1 = skillRepository.saveAndFlush(keep1);
        keep2 = skillRepository.saveAndFlush(keep2);
        delete1 = skillRepository.saveAndFlush(delete1);

        Set<Skill> skillSet = new HashSet<>(Arrays.asList(keep1, keep2, delete1));
        Profile profile = new Profile();
        profile.setSkills(skillSet);

        Project project = new Project();
        project.setSkills(new HashSet<>(Arrays.asList(keep1, delete1)));
        projectRepository.saveAndFlush(project);

        profile.getProjects().add(project);
        profileRepository.saveAndFlush(profile);
        ReflectionTestUtils.invokeMethod(adminNotificationService, "deleteSkillsWithSameName", delete1.getName());

        Profile retreivedProfile = profileRepository.findAll().get(0);

        assertThat(retreivedProfile.getSkills()).doesNotContain(delete1);
        assertThat(retreivedProfile.getSkills()).containsExactlyInAnyOrder(keep1, keep2);
        assertThat(retreivedProfile.getProjects().size()).isEqualTo(1);
        Project retreivedProject = retreivedProfile.getProjects().iterator().next();
        assertThat(retreivedProject.getSkills()).doesNotContain(delete1);
        assertThat(retreivedProject.getSkills()).containsExactlyInAnyOrder(keep1);
    }


    private Long makePersistentProfileWithSkills(List<Pair<Skill, Boolean>> skillNames) {
        Profile profile = new Profile();
        for (Pair<Skill, Boolean> stringBooleanPair : skillNames) {
            profile.getSkills().add(stringBooleanPair.getFirst());
            if (stringBooleanPair.getSecond()) {
                Project project = new Project();
                project.getSkills().add(stringBooleanPair.getFirst());
                profile.getProjects().add(project);
            }
        }
        profileUpdateService.importProfile(profile);
        return profileRepository.save(profile).getId();
    }

    private void assertAnyProjectContains(Profile p, Skill skill) {
        boolean contains = false;
        for (Project project : p.getProjects()) {
            if (project.getSkills().contains(skill)) {
                contains = true;
                break;
            }
        }

        if (!contains) {
            String failMsgBuilder = skill.toString() +
                    " is not in the given profile(id=" +
                    p.getId() +
                    ") but was expected to be in any of the following projects." +
                    "\n" +
                    p.getProjects().toString();
            fail(failMsgBuilder);
        }
    }

    private void assertNoProjectContains(Profile p, Skill skill) {
        for (Project project : p.getProjects()) {
            if (project.getSkills().contains(skill)) {
                fail(skill.toString() + " was present in " + project.toString());
            }
        }
    }


    /**
     * Validates that the deletion of similar skills works for multiple profiles; Multiple skills to delete
     * exists across multiple profiles.
     *
     * @throws Exception on exception
     */
    @Transactional
    @Test
    public void deleteAllSimilarSkillsMultipleProfiles() throws Exception {
        Skill k0 = skillRepository.saveAndFlush(new Skill("Keep0", 1));
        Skill k1 = skillRepository.saveAndFlush(new Skill("Keep1", 1));
        Skill k2 = skillRepository.saveAndFlush(new Skill("Keep2", 1));
        Skill k3 = skillRepository.saveAndFlush(new Skill("Keep3", 1));

        Skill d0 = skillRepository.saveAndFlush(new Skill("Delete0", 1));
        Skill d1 = skillRepository.saveAndFlush(new Skill("Delete1", 1));


        // Profile 0
        // in profile: k0, k1, k2, d0, d1
        // in projects: k0, k1, d0, d1
        Long profile0Id = makePersistentProfileWithSkills(
                Arrays.asList(
                        Pair.of(d0, true),
                        Pair.of(d1, true),
                        Pair.of(k0, true),
                        Pair.of(k1, true),
                        Pair.of(k2, false)
                ));


        // Profile 1
        // in profile: k0, k1, k2, d0
        // in projects: d0
        Long profile1Id = makePersistentProfileWithSkills(
                Arrays.asList(
                        Pair.of(d0, true),
                        Pair.of(k0, false),
                        Pair.of(k1, false),
                        Pair.of(k2, false)
                ));

        // Profile 2
        // in profile: d0, d1, k3
        // in projects: d1, k3
        Long profile2Id = makePersistentProfileWithSkills(
                Arrays.asList(
                        Pair.of(d0, false),
                        Pair.of(d1, true),
                        Pair.of(k3, true)
                ));

        // Remove those skills
        ReflectionTestUtils.invokeMethod(adminNotificationService, "deleteSkillsWithSameName", d0.getName());
        ReflectionTestUtils.invokeMethod(adminNotificationService, "deleteSkillsWithSameName", d1.getName());
        // Assert that the profiles do not contain these skills anymore
        Profile p0 = profileRepository.findById(profile0Id).get();
        Profile p1 = profileRepository.findById(profile1Id).get();
        Profile p2 = profileRepository.findById(profile2Id).get();
        assertThat(p0.getSkills()).containsExactlyInAnyOrder(k0, k1, k2);
        assertThat(p1.getSkills()).containsExactlyInAnyOrder(k0, k1, k2);
        assertThat(p2.getSkills()).containsExactlyInAnyOrder(k3);
        assertAnyProjectContains(p0, k0);
        assertAnyProjectContains(p0, k1);
        assertNoProjectContains(p0, d0);
        assertNoProjectContains(p0, d1);

        assertNoProjectContains(p1, d0);

        assertNoProjectContains(p2, d1);
        assertAnyProjectContains(p2, k3);
    }


    @Test
    @Transactional
    public void testSkillWithBlacklistedCategory() {
        String qualifier = "BlacklistedSkill";
        SkillCategory sc = new SkillCategory();
        sc.setBlacklisted(true);


        given(skillProfileClient.updateAndGetCategory(qualifier)).willReturn(sc);


        Profile p = new Profile();
        p = profileRepository.saveAndFlush(p);
        Skill blacklistedSkill = new Skill(qualifier, 1);
        p.getSkills().add(blacklistedSkill);

        profileUpdateService.importProfile(p);

        Collection<AdminNotification> ads = adminNotificationRepository.findAllByAdminNotificationStatus(AdminNotificationStatus.ALIVE);
        assertThat(ads.size()).isEqualTo(1);
        assertThat(ads.iterator().next().getReason().equals(AdminNotificationReason.DANGEROUS_SKILL_ADDED_BLACKLISTED));
        SkillNotification sn = (SkillNotification) ads.iterator().next();
        assertThat(qualifier.equals(sn.getSkill().getName()));
    }

    @Test
    @Transactional
    public void testUnknownSkill() {
        String qualifier = "unknownSkill";
        SkillCategory sc = new SkillCategory();
        sc.setBlacklisted(false);


        given(skillProfileClient.updateAndGetCategory(qualifier)).willReturn(sc);


        Profile p = new Profile();
        p = profileRepository.saveAndFlush(p);
        Skill blacklistedSkill = new Skill(qualifier, 1);
        p.getSkills().add(blacklistedSkill);

        profileUpdateService.importProfile(p);

        List<AdminNotification> ads = new ArrayList<>(adminNotificationRepository.findAllByAdminNotificationStatus(AdminNotificationStatus.ALIVE));
        assertThat(ads.size()).isEqualTo(1);
        assertThat(ads.get(0).getReason()).isEqualTo(AdminNotificationReason.DANGEROUS_SKILL_ADDED_UNKNOWN);
        SkillNotification sn = (SkillNotification) ads.get(0);
        assertThat(sn.getSkill().getName()).isEqualTo(qualifier);
    }

    /**
     * Validates that the {@link AdminNotificationService#fixNameEntity(Long, NameEntity, AdminNotification)} correctly
     * renames only the affected {@link NameEntity} objects.
     */
    /*
    @Test
    @Transactional
    public void testProfileEntryNotificationEditAction() throws Exception {
        Profile p = new Profile();
        p = profileRepository.saveAndFlush(p);
        p.getLanguages().add(new LanguageSkill(new NameEntity("Language_1", NameEntityType.LANGUAGE), LanguageSkillLevel.ADVANCED));
        profileRepository.saveAndFlush(p);
        Profile p2 = new Profile();
        p2 = profileRepository.saveAndFlush(p2);
        p2.getLanguages().add(new LanguageSkill(new NameEntity("Language_1", NameEntityType.LANGUAGE), LanguageSkillLevel.ADVANCED));
        // Should generate a notification
        profileUpdateService.updateProfile(p);
        profileUpdateService.updateProfile(p2);

        Collection<ProfileEntryNotification> profileEntryNotifications = adminNotificationService.findAllAliveBy(ProfileEntryNotification.class);
        assertThat(profileEntryNotifications.size()).isEqualTo(1);
        ProfileEntryNotification notification = (ProfileEntryNotification) profileEntryNotifications.iterator().next();
        assertThat(notification).isNotNull();
        // Simulate the user input -> Change the name entity. This is why the method MUST NOT be transactional
        // It is also important to use a NEW name entity object here, so that no accidental changes to the
        // object in the profile happen.
        notification.setNameEntity(new NameEntity("Language_IS_NOW_OK", NameEntityType.LANGUAGE));
        // So, this is in fact a constraint that checks that the test is correct.
        assertThat(((LanguageSkill)p.getLanguages().toArray()[0]).getNameEntity()).isNotSameAs(notification.getNameEntity());

        notification.executeEditAction(adminNotificationService);

        // Check that the language has been edited correctly
        Profile retrieved1 = profileRepository.getOne(p.getId());
        LanguageSkill languageSkill1 = (LanguageSkill) retrieved1.getLanguages().toArray()[0];
        assertThat(languageSkill1).isNotNull();
        assertThat(languageSkill1.getNameEntity().getName()).isEqualTo("Language_IS_NOW_OK");

        Profile retrieved2 = profileRepository.getOne(p2.getId());
        LanguageSkill languageSkill2 = (LanguageSkill) retrieved1.getLanguages().toArray()[0];
        assertThat(languageSkill2).isNotNull();
        assertThat(languageSkill2.getNameEntity().getName()).isEqualTo("Language_IS_NOW_OK");

        // Validate that the notification has been deleted
        Collection<AdminNotification> notificationsRetrieved = adminNotificationService.findAllAlive();
        assertThat(notificationsRetrieved).isEmpty();
    }
    */

    /**
     * Validates that the {@link AdminNotificationService#fixNameEntity(Long, NameEntity, AdminNotification)}
     * can be executed correctly when the desired name already exists.
     */
    @Test
    public void testProfileEntryNotificationEditActionWithNewNameExisting() {
        NameEntity nameEntityTarget = nameEntityRepository.saveAndFlush(new NameEntity("Language_TARGET", NameEntityType.LANGUAGE));

        Profile p = new Profile();
        p = profileRepository.saveAndFlush(p);
        p.getLanguages().add(new LanguageSkill(new NameEntity("Language_1", NameEntityType.LANGUAGE), LanguageSkillLevel.ADVANCED));

        p = profileUpdateService.updateProfile(p);
        NameEntity originalNameEntity = nameEntityRepository.findByName("Language_1");

        Collection<ProfileEntryNotification> profileEntryNotifications = adminNotificationService.findAllAliveBy(ProfileEntryNotification.class);
        assertThat(profileEntryNotifications.size()).isEqualTo(1);
        ProfileEntryNotification notification = profileEntryNotifications.iterator().next();
        assertThat(notification).isNotNull();

        // This mimics the way the entity field is used. When an edit is invoked, the nameEntity field
        // Will store the information about the rename. (Might also include a type change)
        notification.setNameEntity(new NameEntity(originalNameEntity.getId(), nameEntityTarget.getName(), nameEntityTarget.getType()));
        notification.executeEditAction(adminNotificationService);

        // Check that the language has been edited correctly
        Profile retrieved1 = profileRepository.getOne(p.getId());
        //LanguageSkill languageSkill1 = (LanguageSkill) retrieved1.getLanguages().toArray()[0];
        //assertThat(languageSkill1).isNotNull();
        //assertThat(languageSkill1.getNameEntity()).isEqualToComparingFieldByField(nameEntityTarget);

        // Also, check that the original does not exist anymore (it was renamed -> poof!)
        assertThat(nameEntityRepository.findByName("Language_1")).isNull();
    }

    /**
     * Valdiates that the {@link ProfileEntryNotification} delete action correctly deletes the name entity
     * and all entries referencing it. Uses two profiles with the same name entity in an entry
     */
    /*
    @Test
    @Transactional
    public void testProfileEntryDeleteAction() {
        String toDeleteName = "Language_to_delete";
        Profile profile1 = profileRepository.saveAndFlush(new Profile());
        Profile profile2 = profileRepository.saveAndFlush(new Profile());

        NameEntity nameEntity1 = new NameEntity(toDeleteName, NameEntityType.LANGUAGE);
        LanguageSkill languageSkill = new LanguageSkill(nameEntity1, LanguageSkillLevel.ADVANCED);
        profile1.getLanguages().add(languageSkill);

        profile2.getLanguages().add(new LanguageSkill(new NameEntity(toDeleteName, NameEntityType.LANGUAGE), LanguageSkillLevel.ADVANCED));

        profile1 = profileUpdateService.updateProfile(profile1);
        profileUpdateService.updateProfile(profile2);

        Collection<ProfileEntryNotification> profileEntryNotifications = adminNotificationService.findAllAliveBy(ProfileEntryNotification.class);
        assertThat(profileEntryNotifications.size()).isEqualTo(1);
        ProfileEntryNotification notification = profileEntryNotifications.iterator().next();
        assertThat(notification).isNotNull();

        notification.executeDeleteAction(adminNotificationService);

        // Check that notification and profile entry got deleted.
        // Also validate that the name entity isnt around anymore
        assertThat(adminNotificationService.findAllAlive()).isEmpty();
        Profile retrieved1 = profileRepository.getOne(profile1.getId());
        Profile retrieved2 = profileRepository.getOne(profile1.getId());
        assertThat(retrieved1.getLanguages()).isEmpty();
        assertThat(retrieved2.getLanguages()).isEmpty();

        NameEntity nameEntity = nameEntityRepository.findByName(toDeleteName);
        assertThat(nameEntity).isNull();

    }
*/

}
