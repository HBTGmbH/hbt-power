package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.model.profile.entries.SectorEntry;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.Set;

import static de.hbt.pwr.profile.model.profile.NameEntityType.COMPANY;
import static de.hbt.pwr.profile.model.profile.NameEntityType.PROJECT_ROLE;
import static de.hbt.pwr.profile.model.profile.NameEntityType.SECTOR;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * No profile element without a name (#215): names are trimmed, a blank one never becomes a {@link NameEntity}
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class BlankNameEntityITest extends AbstractIntegrationTest {

    @Autowired
    private ProfileEntryService profileEntryService;
    @Autowired
    private ProfileRepository profileRepository;
    @Autowired
    private NameEntityRepository nameEntityRepository;
    @Autowired
    private ConsultantService consultantService;
    @Autowired
    private MockMvc mockMvc;

    private static NameEntity named(String name, NameEntityType type) {
        return NameEntity.builder().name(name).type(type).build();
    }

    private Profile profile() {
        return profileRepository.save(new Profile());
    }

    private void assertNoBlankNameEntity() {
        assertThat(nameEntityRepository.findAll())
                .extracting(NameEntity::getName)
                .allSatisfy(name -> assertThat(name).isNotBlank());
    }

    @Test
    public void entryNameIsTrimmed() {
        SectorEntry entry = profileEntryService.updateProfileEntry(new SectorEntry(named("  Banken ", SECTOR)), profile(), SECTOR);

        assertThat(entry.getNameEntity().getName()).isEqualTo("Banken");
        assertThat(nameEntityRepository.findByNameAndType("Banken", SECTOR)).isNotNull();
    }

    @Test
    public void trimmedEntryNameFindsTheExistingElement() {
        NameEntity banks = nameEntityRepository.save(named("Banken", SECTOR));

        SectorEntry entry = profileEntryService.updateProfileEntry(new SectorEntry(named("Banken  ", SECTOR)), profile(), SECTOR);

        assertThat(entry.getNameEntity().getId()).isEqualTo(banks.getId());
    }

    @Test
    public void entryWithEmptyNameIsRejected() {
        assertRejected(new SectorEntry(named("", SECTOR)));
    }

    @Test
    public void entryWithBlankNameIsRejected() {
        assertRejected(new SectorEntry(named("   ", SECTOR)));
    }

    @Test
    public void entryWithoutNameIsRejected() {
        assertRejected(new SectorEntry(null));
    }

    private void assertRejected(SectorEntry entry) {
        Profile profile = profile();
        WebApplicationException e = catchThrowableOfType(
                () -> profileEntryService.updateProfileEntry(entry, profile, SECTOR), WebApplicationException.class);

        assertThat(e).isNotNull();
        assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(profile.getSectors()).isEmpty();
        assertNoBlankNameEntity();
    }

    @Test
    public void endpointAnswersBadRequestForABlankName() throws Exception {
        consultantService.createNewConsultant("bln", "Bea", "Blank", null, null, LocalDate.of(1990, 1, 1));

        mockMvc.perform(put("/profile/bln/sector")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nameEntity\": {\"name\": \"  \", \"type\": \"SECTOR\"}}"))
                .andExpect(status().isBadRequest());

        assertNoBlankNameEntity();
    }

    @Test
    public void emptiedBrokerAndClientAreNone() {
        Project project = Project.builder().name("P").broker(named("", COMPANY)).client(named("  ", COMPANY)).build();

        Project saved = profileEntryService.updateProject(project, profile());

        assertThat(saved.getBroker()).isNull();
        assertThat(saved.getClient()).isNull();
        assertNoBlankNameEntity();
    }

    @Test
    public void brokerAndClientAreTrimmed() {
        Project project = Project.builder().name("P").broker(named(" Vermittler GmbH ", COMPANY))
                .client(named("Kunde AG  ", COMPANY)).build();

        Project saved = profileEntryService.updateProject(project, profile());

        assertThat(saved.getBroker().getName()).isEqualTo("Vermittler GmbH");
        assertThat(saved.getClient().getName()).isEqualTo("Kunde AG");
    }

    @Test
    public void blankRolesAreDroppedAndOthersTrimmed() {
        Project project = Project.builder().name("P")
                .projectRoles(new java.util.HashSet<>(Set.of(named("", PROJECT_ROLE), named("   ", PROJECT_ROLE),
                        named(" Architekt ", PROJECT_ROLE))))
                .build();

        Project saved = profileEntryService.updateProject(project, profile());

        assertThat(saved.getProjectRoles()).extracting(NameEntity::getName).containsExactly("Architekt");
        assertNoBlankNameEntity();
    }
}
