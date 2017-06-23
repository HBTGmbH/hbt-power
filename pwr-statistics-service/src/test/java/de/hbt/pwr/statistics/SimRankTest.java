package de.hbt.pwr.statistics;

import de.hbt.pwr.model.SimRank.ProfileNode;
import de.hbt.pwr.model.SimRank.ProfileSkillNetwork;
import de.hbt.pwr.model.SimRank.SkillNode;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;
import org.junit.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;


public class SimRankTest {

    private static Skill skillOf(String name) {
        Skill res = new Skill();
        res.setName(name);
        return res;
    }

    @Test
    public void testBuildInitialRating() {
        // Testing with 3 profiles sharing a few skills
        Skill s1 = skillOf("S1");
        Skill s2 = skillOf("S2");
        Skill s3 = skillOf("S3");
        Skill s4 = skillOf("S4");

        Set<Skill> skillSet1 = new HashSet<>(Arrays.asList(s1, s2));
        Set<Skill> skillSet2 = new HashSet<>(Arrays.asList(s2, s3, s4));
        Set<Skill> skillSet3 = new HashSet<>(Arrays.asList(s1, s4));

        Profile profile1 = new Profile();
        profile1.setSkills(skillSet1);
        profile1.setId(1L);

        Profile profile2 = new Profile();
        profile2.setSkills(skillSet2);
        profile2.setId(2L);

        Profile profile3 = new Profile();
        profile3.setSkills(skillSet3);
        profile3.setId(3L);

        SimRank simRank = new SimRank();

        ProfileSkillNetwork network = ReflectionTestUtils.invokeMethod(simRank, "buildInitialRating", Arrays.asList(profile1, profile2, profile3));

        assertThat(network.getProfileNodes().size()).isEqualTo(3);
        assertThat(network.getSkillNodes().size()).isEqualTo(4);
        assertThat(network.getSkillSimilarities().size()).isEqualTo(16);
        assertThat(network.getProfileSimilarities().size()).isEqualTo(9);

        // Get the node with profile id = 1 and check it
        Optional<ProfileNode> optional = network.getProfileNodes().stream().filter(profileNode -> profileNode.getProfileId().equals(1L)).findFirst();
        assertThat(optional.isPresent()).isTrue();
        ProfileNode node = optional.get();
        assertThat(node.getSkillNodes()).containsExactlyInAnyOrder(new SkillNode("S2"), new SkillNode("S1"));

        // Now, check that back references work
        node.getSkillNodes().forEach(skillNode -> assertThat(skillNode.getProfileNodes().contains(new ProfileNode(profile1))));
    }

    @Test
    public void testRankRuns() {
        // Testing with 3 profiles sharing a few skills
        Skill s1 = skillOf("S1");
        Skill s2 = skillOf("S2");
        Skill s3 = skillOf("S3");
        Skill s4 = skillOf("S4");

        Set<Skill> skillSet1 = new HashSet<>(Arrays.asList(s1, s2));
        Set<Skill> skillSet2 = new HashSet<>(Arrays.asList(s2, s3, s4));
        Set<Skill> skillSet3 = new HashSet<>(Arrays.asList(s1, s4));

        Profile profile1 = new Profile();
        profile1.setSkills(skillSet1);
        profile1.setId(1L);

        Profile profile2 = new Profile();
        profile2.setSkills(skillSet2);
        profile2.setId(2L);

        Profile profile3 = new Profile();
        profile3.setSkills(skillSet3);
        profile3.setId(3L);

        SimRank simRank = new SimRank();

        ProfileSkillNetwork network = simRank.rank(Arrays.asList(profile1, profile2, profile3));
    }
}