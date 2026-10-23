package de.hbt.pwr.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.hbt.pwr.client.SkillTreeClient;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Project;
import de.hbt.pwr.model.profile.Skill;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Skills count under the names of the skill tree (#208)
 */
public class SkillNameNormalizerTest {

    static final String TREE = "{\"qualifier\": \"##ROOT##\", \"childSkills\": [], \"childCategories\": ["
            + "{\"qualifier\": \"Frameworks\", \"childCategories\": [{\"qualifier\": \"Backend\", \"childCategories\": [],"
            + "  \"childSkills\": [{\"qualifier\": \".NET\", \"aliases\": [\".NET Core\"]}]}],"
            + " \"childSkills\": [{\"qualifier\": \"Spring Framework\", \"aliases\": [\"Spring\"]}]},"
            + "{\"qualifier\": \"Other\", \"childCategories\": [],"
            + " \"childSkills\": [{\"qualifier\": \"Spring\", \"aliases\": []}]}"
            + "]}";

    private SkillTreeClient skillTreeClient;
    private SkillNameNormalizer normalizer;

    static SkillNames skillNames() throws Exception {
        return SkillNames.fromTree(new ObjectMapper().readTree(TREE));
    }

    @BeforeEach
    public void setUp() throws Exception {
        skillTreeClient = mock(SkillTreeClient.class);
        when(skillTreeClient.getSkillNames()).thenReturn(Optional.of(skillNames()));
        normalizer = new SkillNameNormalizer(skillTreeClient);
        normalizer.refresh();
    }

    @Test
    public void treeName_ofOtherSpellingOrAlias_isTheNameOfTheSkill() {
        assertThat(normalizer.treeName(".Net")).isEqualTo(".NET");
        assertThat(normalizer.treeName(" .net core ")).isEqualTo(".NET");
        assertThat(normalizer.treeName("Unknown Tool ")).isEqualTo("Unknown Tool");
    }

    @Test
    public void treeName_ofASkillThatIsAlsoAnAliasOfAnother_staysTheSkill() {
        assertThat(normalizer.treeName("spring")).isEqualTo("Spring");
    }

    @Test
    public void normalize_bringsProfileAndProjectSkillsToTheTreeNames_keepingTheHigherRating() {
        Project project = new Project();
        project.setSkills(skills(new Skill(".net core", 2), new Skill(".NET", 1)));
        Profile profile = new Profile();
        profile.setSkills(skills(new Skill(".Net", 3), new Skill(".NET", 2), new Skill(".NET Core", 4),
                new Skill("Unknown Tool", 1)));
        profile.setProjects(new HashSet<>(List.of(project)));
        Consultant consultant = new Consultant();
        consultant.setProfile(profile);

        normalizer.normalize(consultant);

        assertThat(profile.getSkills()).extracting(Skill::getName, Skill::getRating)
                .containsExactlyInAnyOrder(tuple(".NET", 4), tuple("Unknown Tool", 1));
        assertThat(project.getSkills()).extracting(Skill::getName, Skill::getRating)
                .containsExactly(tuple(".NET", 2));
    }

    @Test
    public void refresh_withoutAnswer_keepsTheLastKnownNames() {
        when(skillTreeClient.getSkillNames()).thenReturn(Optional.empty());

        normalizer.refresh();

        assertThat(normalizer.treeName(".Net")).isEqualTo(".NET");
    }

    @Test
    public void withoutSkillTree_namesStayAsTheyAre() {
        SkillNameNormalizer withoutTree = new SkillNameNormalizer(mock(SkillTreeClient.class));
        withoutTree.refresh();

        assertThat(withoutTree.treeName(".Net")).isEqualTo(".Net");
    }

    private static HashSet<Skill> skills(Skill... skills) {
        return new HashSet<>(Arrays.asList(skills));
    }
}
