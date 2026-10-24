package de.hbt.pwr.profile.service.housekeeping;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.model.HousekeepingFindings;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.AdminNotificationReason;
import de.hbt.pwr.profile.model.notification.SkillNotification;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.model.profile.entries.SectorEntry;
import de.hbt.pwr.profile.service.ConsultantService;
import de.hbt.pwr.profile.service.NameEntityAdminService;
import de.hbt.pwr.profile.service.ProfileEntryService;
import de.hbt.pwr.profile.service.ProfileService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static de.hbt.pwr.profile.model.profile.NameEntityType.COMPANY;
import static de.hbt.pwr.profile.model.profile.NameEntityType.SECTOR;
import static de.hbt.pwr.profile.service.housekeeping.HousekeepingService.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * No way of changing profiles leaves rows behind that the housekeeping would have to clean (#254): every entry,
 * project and skill that leaves its profile is deleted, with the notifications about it
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class NoLeftoversITest extends AbstractIntegrationTest {

    private static final String[] CHECKS = {ENTRIES_WITHOUT_PROFILE, PROJECTS_WITHOUT_PROFILE, SKILLS_WITHOUT_PROFILE,
            NOTIFICATIONS_WITHOUT_ENTRY, ENTRY_ROWS_WITHOUT_TYPE};

    @Autowired
    private HousekeepingService housekeepingService;
    @Autowired
    private ConsultantService consultantService;
    @Autowired
    private ProfileEntryService profileEntryService;
    @Autowired
    private ProfileService profileService;
    @Autowired
    private NameEntityAdminService nameEntityAdminService;
    @Autowired
    private AdminNotificationRepository adminNotificationRepository;
    @Autowired
    private EntityManager entityManager;

    private Profile bea;
    private Map<String, Long> before;

    @Before
    public void setUp() {
        bea = consultantService.createNewConsultant("bea", "Bea", "Bleibt", null, null, LocalDate.of(1990, 1, 1)).getProfile();
        before = counts();
    }

    private Map<String, Long> counts() {
        entityManager.flush();
        return housekeepingService.check().stream()
                .collect(Collectors.toMap(HousekeepingFindings::getCheck, HousekeepingFindings::getCount));
    }

    private void assertNoLeftovers() {
        Map<String, Long> after = counts();
        Map<String, Long> added = new HashMap<>();
        for (String check : CHECKS) {
            added.put(check, after.get(check) - before.get(check));
        }
        assertThat(added.values()).as("new left-overs per check: " + added).containsOnly(0L);
    }

    private static NameEntity named(String name, NameEntityType type) {
        return NameEntity.builder().name(name).type(type).build();
    }

    private Skill skill(String name, int rating) {
        return profileEntryService.updateProfileSkills(Skill.builder().name(name).rating(rating).versions(new HashSet<>()).build(), bea);
    }

    private Project project(String name, Skill... skills) {
        Set<Skill> projectSkills = new HashSet<>();
        for (Skill skill : skills) {
            projectSkills.add(skill);
        }
        Project project = Project.builder().name(name).client(named("Kunde AG", COMPANY)).projectRoles(new HashSet<>())
                .skills(projectSkills).build();
        return profileEntryService.updateProject(project, bea);
    }

    private void unknownSkillNotification(Skill skill) {
        adminNotificationRepository.save(new SkillNotification(bea, AdminNotificationReason.DANGEROUS_SKILL_ADDED_UNKNOWN, skill));
    }

    @Test
    public void deletingASkillOfTheProfile() {
        Skill kotlin = skill("Kotlin", 3);
        Project project = project("Projekt", kotlin);
        unknownSkillNotification(kotlin);
        entityManager.flush();

        profileEntryService.deleteSkill(kotlin.getId(), bea);

        assertNoLeftovers();
        // A skill of a project is one of the profile, so it goes from the projects too
        assertThat(entityManager.find(Project.class, project.getId()).getSkills()).isEmpty();
    }

    @Test
    public void removingASkillFromAProjectOnly() {
        Skill kotlin = skill("Kotlin", 3);
        Project project = project("Projekt", kotlin);
        entityManager.flush();
        project.getSkills().clear();
        profileEntryService.updateProject(project, bea);

        assertNoLeftovers();
        assertThat(bea.getSkills()).extracting(Skill::getName).contains("Kotlin");
    }

    @Test
    public void deletingAnEntryOfTheProfile() {
        SectorEntry sector = profileEntryService.updateProfileEntry(new SectorEntry(named("Banken", SECTOR)), bea, SECTOR);
        // Like two requests: an entry added and removed before a flush never was in the stored collection
        entityManager.flush();
        profileEntryService.deleteEntryWithId(sector.getId(), bea, SECTOR);

        assertNoLeftovers();
    }

    @Test
    public void changingTheNameOfAnEntry() {
        SectorEntry sector = profileEntryService.updateProfileEntry(new SectorEntry(named("Banken", SECTOR)), bea, SECTOR);
        entityManager.flush();
        SectorEntry changed = new SectorEntry(named("Versicherungen", SECTOR));
        changed.setId(sector.getId());
        profileEntryService.updateProfileEntry(changed, bea, SECTOR);

        assertNoLeftovers();
    }

    @Test
    public void mergingSkillsThatAProfileHasBoth() {
        Skill kotlin = skill("Kotlin", 3);
        Skill java = skill("Java", 4);
        project("Projekt", kotlin, java);
        unknownSkillNotification(kotlin);
        when(skillProfileClient.mergeSkills("Kotlin", "Java")).thenReturn("Java");
        entityManager.flush();

        profileService.mergeSkills("Kotlin", "Java", null);

        assertNoLeftovers();
    }

    @Test
    public void renamingASkillToOneTheProfileHas() {
        skill("Kotlin", 3);
        skill("Java", 4);
        when(skillProfileClient.renameSkill("Kotlin", "Java")).thenReturn("Java");
        entityManager.flush();

        profileService.renameSkill("Kotlin", "Java");

        assertNoLeftovers();
    }

    @Test
    public void deletingASkillFromAllProfiles() throws Exception {
        Skill kotlin = skill("Kotlin", 3);
        project("Projekt", kotlin);
        unknownSkillNotification(kotlin);
        when(skillProfileClient.requireTreeSkill(anyString()))
                .thenReturn(new ObjectMapper().readTree("{\"id\": 1, \"qualifier\": \"Kotlin\", \"aliases\": []}"));
        entityManager.flush();

        profileService.deleteSkill("Kotlin");

        assertNoLeftovers();
    }

    @Test
    public void mergingAndDeletingProfileElements() {
        profileEntryService.updateProfileEntry(new SectorEntry(named("Banken", SECTOR)), bea, SECTOR);
        profileEntryService.updateProfileEntry(new SectorEntry(named("Bankwesen", SECTOR)), bea, SECTOR);
        entityManager.flush();
        NameEntity banken = nameEntity("Banken");
        NameEntity bankwesen = nameEntity("Bankwesen");

        nameEntityAdminService.merge(bankwesen.getId(), banken.getId());
        assertNoLeftovers();

        nameEntityAdminService.delete(banken.getId());
        assertNoLeftovers();
    }

    private NameEntity nameEntity(String name) {
        return entityManager.createQuery("select n from NameEntity n where n.name = :name and n.type = :type", NameEntity.class)
                .setParameter("name", name).setParameter("type", SECTOR).getSingleResult();
    }
}
