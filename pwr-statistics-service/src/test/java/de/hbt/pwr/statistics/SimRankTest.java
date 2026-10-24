package de.hbt.pwr.statistics;

import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;
import de.hbt.pwr.statistics.legacy.LegacySimRank;
import de.hbt.pwr.statistics.legacy.ProfileSkillNetwork;
import org.junit.jupiter.api.Test;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;


public class SimRankTest {

    static Profile profile(long id, String... skills) {
        Profile profile = new Profile();
        profile.setId(id);
        profile.setSkills(Arrays.stream(skills).map(name -> {
            Skill skill = new Skill();
            skill.setName(name);
            return skill;
        }).collect(Collectors.toSet()));
        return profile;
    }

    /**
     * Random profiles, the same ones for the same seed
     */
    static List<Profile> randomProfiles(long seed, int profiles, int skills, int minSkills, int maxSkills) {
        Random random = new Random(seed);
        List<String> names = IntStream.range(0, skills).mapToObj(i -> "Skill " + i).collect(Collectors.toList());
        return IntStream.range(0, profiles).mapToObj(id -> {
            List<String> shuffled = new ArrayList<>(names);
            Collections.shuffle(shuffled, random);
            int count = minSkills + random.nextInt(maxSkills - minSkills + 1);
            return profile(id + 1, shuffled.subList(0, count).toArray(new String[0]));
        }).collect(Collectors.toList());
    }

    @Test
    public void theValues_ofASmallNetwork_areTheOnesComputedByHand() {
        // A has x, B has y, C has both
        List<Profile> profiles = Arrays.asList(profile(1, "x"), profile(2, "y"), profile(3, "x", "y"));

        SimRank.Similarities once = new SimRank(1).rank(profiles);
        // 0.8 / (1 * 1) * s(x, y) = 0.8 * 0
        assertThat(once.profileSimilarity(1L, 2L)).isEqualTo(0.0);
        // 0.8 / (1 * 2) * (s(x, x) + s(x, y)) = 0.4 * 1
        assertThat(once.profileSimilarity(1L, 3L)).isCloseTo(0.4, within(1e-12));
        // 0.8 / (2 * 2) * (s(A, B) + s(A, C) + s(C, B) + s(C, C)) = 0.2 * 1
        assertThat(once.skillSimilarity("x", "y")).isCloseTo(0.2, within(1e-12));

        SimRank.Similarities twice = new SimRank(2).rank(profiles);
        assertThat(twice.profileSimilarity(1L, 2L)).isCloseTo(0.8 * 0.2, within(1e-12));
        assertThat(twice.profileSimilarity(1L, 3L)).isCloseTo(0.4 * (1 + 0.2), within(1e-12));
        assertThat(twice.skillSimilarity("x", "y")).isCloseTo(0.2 * (0 + 0.4 + 0.4 + 1), within(1e-12));
        // Symmetric, 1 on the diagonal
        assertThat(twice.profileSimilarity(3L, 1L)).isEqualTo(twice.profileSimilarity(1L, 3L));
        assertThat(twice.profileSimilarity(2L, 2L)).isEqualTo(1.0);
        assertThat(twice.skillSimilarity("y", "y")).isEqualTo(1.0);
    }

    @Test
    public void theValues_areTheSameAsThoseOfTheImplementationBefore() {
        List<Profile> profiles = new ArrayList<>(randomProfiles(292, 25, 60, 1, 15));
        // Two profiles share no skill, one has none (NaN to every other profile, before as now)
        profiles.add(profile(100, "Nur hier"));
        profiles.add(profile(101));

        SimRank.Similarities similarities = new SimRank().rank(profiles);
        ProfileSkillNetwork before = new LegacySimRank().rank(profiles);

        assertThat(similarities.profileIds()).hasSize(profiles.size());
        for (Profile profile1 : profiles) {
            for (Profile profile2 : profiles) {
                double expected = before.getProfileSimilarity(profile1.getId(), profile2.getId()).getSimVal();
                assertSame(similarities.profileSimilarity(profile1.getId(), profile2.getId()), expected);
            }
        }
        assertThat(similarities.skillNames()).hasSize(before.getSkillNodes().size());
        for (String skill1 : similarities.skillNames()) {
            for (String skill2 : similarities.skillNames()) {
                assertSame(similarities.skillSimilarity(skill1, skill2), before.getSkillSimilarity(skill1, skill2).getSimVal());
            }
        }
        assertThat(similarities.profileSimilarity(101L, 1L)).isNaN();
        assertThat(similarities.profileSimilarity(100L, 1L)).isEqualTo(0.0);
    }

    /**
     * Equal apart from rounding: the sums run in another order
     */
    private static void assertSame(double actual, double expected) {
        if (Double.isNaN(expected)) {
            assertThat(actual).isNaN();
        } else {
            assertThat(actual).isCloseTo(expected, within(1e-12 + Math.abs(expected) * 1e-9));
        }
    }

    @Test
    public void aSkillTwiceInAProfile_countsOnce() {
        Profile twice = profile(1, "x");
        Skill again = new Skill();
        again.setName("x");
        again.setRating(3);
        twice.getSkills().add(again);
        List<Profile> profiles = Arrays.asList(twice, profile(2, "x", "y"));

        // 0.8 / (1 * 2) * (s(x, x) + s(x, y)) after one iteration
        assertThat(new SimRank(1).rank(profiles).profileSimilarity(1L, 2L)).isCloseTo(0.4, within(1e-12));
    }

    @Test
    public void anUnknownProfileOrSkill_isAnError() {
        SimRank.Similarities similarities = new SimRank().rank(Collections.singletonList(profile(1, "x")));

        assertThatThrownBy(() -> similarities.profileSimilarity(1L, 2L)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> similarities.skillSimilarity("x", "y")).isInstanceOf(IllegalArgumentException.class);
    }
}
