package de.hbt.pwr.controller;

import de.hbt.pwr.client.PowerProfileClient;
import de.hbt.pwr.client.SkillTreeClient;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;
import de.hbt.pwr.repo.ClusteredNetworkRepo;
import de.hbt.pwr.repo.ConsultantRepository;
import de.hbt.pwr.service.AsyncInformationService;
import de.hbt.pwr.service.SkillNameNormalizer;
import de.hbt.pwr.service.SkillNames;
import de.hbt.pwr.service.StatisticsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The refresh after a merge (#205): the stored consultants are replaced by the current ones before the answer.
 */
public class StatisticsAdminControllerTest {

    private ConsultantRepository consultantRepository;
    private PowerProfileClient powerProfileClient;
    private SkillTreeClient skillTreeClient;
    private MockMvc mockMvc;

    @BeforeEach
    public void setUp() {
        consultantRepository = mock(ConsultantRepository.class);
        powerProfileClient = mock(PowerProfileClient.class);
        skillTreeClient = mock(SkillTreeClient.class);
        AsyncInformationService service = new AsyncInformationService(consultantRepository, powerProfileClient,
                mock(ClusteredNetworkRepo.class), new SkillNameNormalizer(skillTreeClient));
        mockMvc = MockMvcBuilders.standaloneSetup(new StatisticsAdminController(service, mock(StatisticsService.class))).build();
    }

    @Test
    public void refreshReplacesTheStoredConsultantsBeforeAnswering() throws Exception {
        Consultant stored = consultant("old", "Warp");
        Consultant current = consultant("new", "Warp-Drive Development");
        when(consultantRepository.findAll()).thenReturn(Collections.singletonList(stored));
        when(powerProfileClient.getAllConsultants()).thenReturn(Collections.singletonList(current));

        mockMvc.perform(post("/admin/consultants/refresh")).andExpect(status().isNoContent());

        InOrder inOrder = inOrder(powerProfileClient, consultantRepository);
        inOrder.verify(powerProfileClient).getAllConsultants();
        inOrder.verify(consultantRepository).deleteAll(Collections.singletonList(stored));
        inOrder.verify(consultantRepository).saveAll(List.of(current));
    }

    @Test
    public void refreshStoresTheSkillsUnderTheNamesOfTheSkillTree() throws Exception {
        when(skillTreeClient.getSkillNames()).thenReturn(Optional.of(SkillNames.fromTree(new ObjectMapper().readTree(
                "{\"childCategories\": [{\"childSkills\": [{\"qualifier\": \".NET\", \"aliases\": [\".NET Core\"]}]}]}"))));
        Consultant current = consultant("new", ".NET Core");
        when(powerProfileClient.getAllConsultants()).thenReturn(Collections.singletonList(current));

        mockMvc.perform(post("/admin/consultants/refresh")).andExpect(status().isNoContent());

        verify(consultantRepository).saveAll(List.of(current));
        assertThat(current.getProfile().getSkills()).extracting(Skill::getName).containsExactly(".NET");
    }

    @Test
    public void refreshFailsWithoutTouchingTheStoredConsultantsIfTheProfileServiceIsDown() {
        when(powerProfileClient.getAllConsultants()).thenThrow(new IllegalStateException("profile service down"));

        // Standalone MockMvc passes the exception through instead of answering 500
        assertThatThrownBy(() -> mockMvc.perform(post("/admin/consultants/refresh")))
                .hasRootCauseInstanceOf(IllegalStateException.class);

        verify(consultantRepository, never()).deleteAll(anyIterable());
        verify(consultantRepository, never()).saveAll(anyIterable());
    }

    private static Consultant consultant(String initials, String skillName) {
        Consultant consultant = new Consultant();
        consultant.setInitials(initials);
        Profile profile = new Profile();
        profile.setSkills(Collections.singleton(new Skill(skillName, 3)));
        consultant.setProfile(profile);
        return consultant;
    }
}
