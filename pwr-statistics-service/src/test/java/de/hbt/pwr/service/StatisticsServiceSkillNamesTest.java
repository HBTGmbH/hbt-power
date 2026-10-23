package de.hbt.pwr.service;

import de.hbt.pwr.client.SkillTreeClient;
import de.hbt.pwr.model.ConsultantSkillInfo;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;
import de.hbt.pwr.repo.ClusteredNetworkRepo;
import de.hbt.pwr.repo.ConsultantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Requests with an alias or another spelling find the skills stored under the names of the skill tree (#208)
 */
public class StatisticsServiceSkillNamesTest {

    private StatisticsService statisticsService;

    @BeforeEach
    public void setUp() throws Exception {
        SkillTreeClient skillTreeClient = mock(SkillTreeClient.class);
        when(skillTreeClient.getSkillNames()).thenReturn(Optional.of(SkillNameNormalizerTest.skillNames()));
        SkillNameNormalizer normalizer = new SkillNameNormalizer(skillTreeClient);
        normalizer.refresh();
        ConsultantRepository consultantRepository = mock(ConsultantRepository.class);
        when(consultantRepository.findAll()).thenReturn(List.of(consultant("abc", ".NET"), consultant("xyz", "Java")));
        statisticsService = new StatisticsService(consultantRepository, mock(ClusteredNetworkRepo.class), normalizer);
    }

    @Test
    public void referencingSkill_byAlias_findsTheConsultant() {
        assertThat(statisticsService.getAllConsultantsReferencingSkill(".NET Core"))
                .extracting(Consultant::getInitials).containsExactly("abc");
    }

    @Test
    public void findConsultantsBySkills_byOtherSpelling_findsTheConsultantWithTheSkill() {
        List<ConsultantSkillInfo> found = statisticsService.findConsultantsBySkills(List.of(".net"));

        assertThat(found).hasSize(1);
        assertThat(found.get(0).getSkills()).extracting(Skill::getName).containsExactly(".NET");
    }

    @Test
    public void findConsultantsBySkills_namesTheInitials() {
        // The webclient looks up the short name by them (#216)
        assertThat(statisticsService.findConsultantsBySkills(List.of("Java")))
                .extracting(ConsultantSkillInfo::getInitials).containsExactly("xyz");
    }

    private static Consultant consultant(String initials, String skillName) {
        Profile profile = new Profile();
        profile.setSkills(new HashSet<>(List.of(new Skill(skillName, 3))));
        Consultant consultant = new Consultant();
        consultant.setInitials(initials);
        consultant.setProfile(profile);
        return consultant;
    }
}
