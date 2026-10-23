package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.client.SkillTreeIndex;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import org.junit.Before;
import org.junit.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * The used skills of the admin area (Profil-Elemente) under the names of the skill tree (#208)
 */
public class SuggestionEndpointSkillsTest {

    private SkillProfileClient skillProfileClient;
    private SuggestionEndpoint endpoint;

    @Before
    public void setUp() {
        ProfileRepository profileRepository = mock(ProfileRepository.class);
        when(profileRepository.findAll()).thenReturn(Arrays.asList(
                profile(".Net", "Java"),
                profile(".NET", ".NET Core", "Unknown Tool")));
        skillProfileClient = mock(SkillProfileClient.class);
        endpoint = new SuggestionEndpoint(null, profileRepository, null, skillProfileClient);
    }

    @Test
    public void usedSkills_appearOnceUnderTheNamesOfTheSkillTree() {
        Map<String, String> treeNames = new HashMap<>();
        treeNames.put(".net", ".NET");
        treeNames.put(".net core", ".NET");
        treeNames.put("java", "Java");
        when(skillProfileClient.getSkillTreeIndex())
                .thenReturn(Optional.of(new SkillTreeIndex(new HashSet<>(), new HashSet<>(), treeNames)));

        assertThat(endpoint.getAllUniqueSkillNames().getBody())
                .containsExactlyInAnyOrder(".NET", "Java", "Unknown Tool");
    }

    @Test
    public void withoutSkillTree_usedSkillsAppearOnceAsTheyAre() {
        when(skillProfileClient.getSkillTreeIndex()).thenReturn(Optional.empty());

        assertThat(endpoint.getAllUniqueSkillNames().getBody())
                .containsExactlyInAnyOrder(".Net", "Java", ".NET", ".NET Core", "Unknown Tool");
    }

    private static Profile profile(String... skillNames) {
        Profile profile = new Profile();
        Arrays.stream(skillNames).forEach(name -> profile.getSkills().add(Skill.builder().name(name).rating(3).build()));
        return profile;
    }
}
