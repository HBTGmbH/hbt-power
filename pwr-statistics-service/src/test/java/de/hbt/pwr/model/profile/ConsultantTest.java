package de.hbt.pwr.model.profile;


import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Created by nt on 23.06.2017.
 */
public class ConsultantTest {
    @Test
    public void hasSkills() {
        Consultant consultant = new Consultant();
        Skill s1 = new Skill("S1", 3);
        Skill s2 = new Skill("S2", 2);
        Skill s3 = new Skill("S3", 2);
        Skill s4 = new Skill("S4", 2);

        Profile p = new Profile();
        p.setSkills(new HashSet<>(Arrays.asList(s1, s2, s3, s4)));
        consultant.setProfile(p);

        assertThat(consultant.hasAllSkills(new HashSet<>(Arrays.asList("S1", "S2")))).isTrue();
        assertThat(consultant.hasAllSkills(new HashSet<>(Arrays.asList("S1", "S2", "S3", "S4", "S5")))).isFalse();
    }

    @Test
    public void hasSkillsEmpty() {
        Consultant consultant = new Consultant();

        Profile p = new Profile();
        consultant.setProfile(p);

        assertThat(consultant.hasAllSkills(new HashSet<>())).isTrue();
        assertThat(consultant.hasAllSkills(new HashSet<>(List.of("S1")))).isFalse();
    }

}
