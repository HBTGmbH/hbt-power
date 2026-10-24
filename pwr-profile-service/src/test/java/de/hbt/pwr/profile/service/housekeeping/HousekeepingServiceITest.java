package de.hbt.pwr.profile.service.housekeeping;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.ProfilePictureRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.HousekeepingFindings;
import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.model.profile.entries.SectorEntry;
import de.hbt.pwr.profile.service.ConsultantService;
import de.hbt.pwr.profile.service.ProfileEntryService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static de.hbt.pwr.profile.model.profile.NameEntityType.COMPANY;
import static de.hbt.pwr.profile.model.profile.NameEntityType.SECTOR;
import static de.hbt.pwr.profile.service.housekeeping.HousekeepingService.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Housekeeping of the profile service (#242): every kind of left-over row is found and deleted, what profiles use
 * stays
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class HousekeepingServiceITest extends AbstractIntegrationTest {

    @Autowired
    private HousekeepingService housekeepingService;
    @Autowired
    private ConsultantService consultantService;
    @Autowired
    private ProfileEntryService profileEntryService;
    @Autowired
    private ProfilePictureRepository profilePictureRepository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private MockMvc mockMvc;

    private Profile anna;

    @Before
    public void setUp() {
        anna = consultantService.createNewConsultant("ann", "Anna", "Alt", null, null, LocalDate.of(1990, 1, 1)).getProfile();
    }

    private static NameEntity named(String name, NameEntityType type) {
        return NameEntity.builder().name(name).type(type).build();
    }

    private SectorEntry sector(String name) {
        return profileEntryService.updateProfileEntry(new SectorEntry(named(name, SECTOR)), anna, SECTOR);
    }

    private Project project(String name, String... skills) {
        Set<Skill> projectSkills = new HashSet<>();
        for (String skill : skills) {
            projectSkills.add(Skill.builder().name(skill).rating(3).versions(new HashSet<>()).build());
        }
        Project project = Project.builder().name(name).client(named("Kunde AG", COMPANY)).projectRoles(new HashSet<>())
                .skills(projectSkills).build();
        return profileEntryService.updateProject(project, anna);
    }

    private Skill skill(String name) {
        return profileEntryService.updateProfileSkills(Skill.builder().name(name).rating(3).versions(new HashSet<>()).build(), anna);
    }

    private Map<String, HousekeepingFindings> findings() {
        entityManager.flush();
        return housekeepingService.check().stream().collect(Collectors.toMap(HousekeepingFindings::getCheck, f -> f));
    }

    private Map<String, Long> counts() {
        return findings().values().stream().collect(Collectors.toMap(HousekeepingFindings::getCheck, HousekeepingFindings::getCount));
    }

    private Profile reloaded() {
        entityManager.flush();
        entityManager.clear();
        return entityManager.find(Profile.class, anna.getId());
    }

    @Test
    public void withoutLeftOvers_everyCheckFindsNothing() {
        // Other test classes leave data behind: what this test adds must not change any count
        Map<String, Long> before = counts();
        sector("Banken");
        project("Portal", "Java");
        skill("Kotlin");

        assertThat(counts()).hasSize(5).isEqualTo(before);
    }

    @Test
    public void entriesWithoutProfile_areFoundAndDeleted() {
        sector("Banken");
        SectorEntry removed = sector("Versicherungen");
        // Deleting an entry removes it from the profile, the row stays
        profileEntryService.deleteEntryWithId(removed.getId(), anna, SECTOR);

        HousekeepingFindings found = findings().get(ENTRIES_WITHOUT_PROFILE);
        assertThat(found.getCount()).isEqualTo(1);
        assertThat(found.getExamples()).containsExactly("Versicherungen (SectorEntry #" + removed.getId() + ")");

        assertThat(housekeepingService.clean(ENTRIES_WITHOUT_PROFILE)).isEqualTo(1);
        assertThat(findings().get(ENTRIES_WITHOUT_PROFILE).getCount()).isZero();
        assertThat(entityManager.find(SectorEntry.class, removed.getId())).isNull();
        assertThat(reloaded().getSectors()).extracting(entry -> entry.getNameEntity().getName()).containsExactly("Banken");
    }

    @Test
    public void rowsOfProfileEntryWithoutAType_areFoundAndDeleted() {
        sector("Banken");
        NameEntity banks = anna.getSectors().iterator().next().getNameEntity();
        entityManager.flush();
        entityManager.createNativeQuery("insert into profile_entry (name_entity_id) values (:n)")
                .setParameter("n", banks.getId()).executeUpdate();

        HousekeepingFindings found = findings().get(ENTRY_ROWS_WITHOUT_TYPE);
        assertThat(found.getCount()).isEqualTo(1);
        assertThat(found.getExamples().get(0)).startsWith("Banken (#");

        assertThat(housekeepingService.clean(ENTRY_ROWS_WITHOUT_TYPE)).isEqualTo(1);
        assertThat(findings().get(ENTRY_ROWS_WITHOUT_TYPE).getCount()).isZero();
        assertThat(reloaded().getSectors()).hasSize(1);
    }

    @Test
    public void projectsWithoutProfile_areDeleted_theirSkillsAreThoseOfTheProfileAndStay() {
        project("Portal", "Java");
        Project removed = project("Altprojekt", "Cobol");
        anna.getProjects().remove(removed);

        assertThat(findings().get(PROJECTS_WITHOUT_PROFILE).getExamples()).containsExactly("Altprojekt (#" + removed.getId() + ")");

        assertThat(housekeepingService.clean(PROJECTS_WITHOUT_PROFILE)).isEqualTo(1);
        Map<String, HousekeepingFindings> after = findings();
        assertThat(after.get(PROJECTS_WITHOUT_PROFILE).getCount()).isZero();
        assertThat(after.get(SKILLS_WITHOUT_PROFILE).getCount()).isZero();
        Profile annaNow = reloaded();
        assertThat(annaNow.getProjects()).extracting(Project::getName).containsExactly("Portal");
        assertThat(annaNow.getSkills()).extracting(Skill::getName).containsExactlyInAnyOrder("Java", "Cobol");
    }

    @Test
    public void aSkillOnlyAProjectWithoutProfileHeld_isFoundOnceTheProjectIsGone() {
        Project removed = project("Altprojekt", "Cobol");
        anna.getProjects().remove(removed);
        anna.getSkills().clear();

        assertThat(findings().get(SKILLS_WITHOUT_PROFILE).getCount()).isZero();
        housekeepingService.clean(PROJECTS_WITHOUT_PROFILE);
        assertThat(findings().get(SKILLS_WITHOUT_PROFILE).getExamples()).hasSize(1).allSatisfy(example -> assertThat(example).startsWith("Cobol (#"));

        housekeepingService.clean(SKILLS_WITHOUT_PROFILE);
        assertThat(entityManager.createQuery("select s from Skill s where s.name = 'Cobol'", Skill.class).getResultList()).isEmpty();
    }

    @Test
    public void skillsWithoutProfileOrProject_areFoundAndDeleted() {
        project("Portal", "Java");
        skill("Kotlin");
        Skill removed = skill("Fortran");
        anna.getSkills().remove(removed);

        assertThat(findings().get(SKILLS_WITHOUT_PROFILE).getExamples()).containsExactly("Fortran (#" + removed.getId() + ")");

        assertThat(housekeepingService.clean(SKILLS_WITHOUT_PROFILE)).isEqualTo(1);
        assertThat(entityManager.find(Skill.class, removed.getId())).isNull();
        assertThat(reloaded().getSkills()).extracting(Skill::getName).containsExactlyInAnyOrder("Java", "Kotlin");
    }

    @Test
    public void picturesNoConsultantShows_areFoundAndDeleted() {
        ProfilePicture shown = picture();
        ProfilePicture leftOver = picture();
        consultantService.createNewConsultant("ber", "Bert", "Bau", null, shown.getId(), LocalDate.of(1990, 1, 1));

        assertThat(findings().get(PICTURES_WITHOUT_CONSULTANT).getExamples()).containsExactly(leftOver.getId());

        assertThat(housekeepingService.clean(PICTURES_WITHOUT_CONSULTANT)).isEqualTo(1);
        assertThat(profilePictureRepository.findAll()).extracting(ProfilePicture::getId).containsExactly(shown.getId());
    }

    private ProfilePicture picture() {
        ProfilePicture picture = new ProfilePicture();
        picture.setImage(new byte[]{1});
        picture.setContentType("image/png");
        return profilePictureRepository.saveAndFlush(picture);
    }

    @Test
    public void examples_areAtMostTen() {
        for (int i = 0; i < 12; i++) {
            picture();
        }

        HousekeepingFindings found = findings().get(PICTURES_WITHOUT_CONSULTANT);
        assertThat(found.getCount()).isEqualTo(12);
        assertThat(found.getExamples()).hasSize(HousekeepingFindings.EXAMPLES);
    }

    @Test
    public void anUnknownCheck_isNotFound() {
        assertThat(catchThrowableOfType(() -> housekeepingService.clean("unknown"), WebApplicationException.class)
                .getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void endpoints_areUnderAdmin() throws Exception {
        picture();
        entityManager.flush();

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[4].check").value(PICTURES_WITHOUT_CONSULTANT))
                .andExpect(jsonPath("$[4].count").value(1));
        mockMvc.perform(delete("/admin/housekeeping/" + PICTURES_WITHOUT_CONSULTANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
        mockMvc.perform(get("/housekeeping")).andExpect(status().isNotFound());
    }
}
