package de.hbt.pwr.model.clustering;

import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class ProfilePrototypeTest {
    @Test
    public void addClusterable()  {
        Skill s1 = new Skill("S1", 4);
        Skill s2 = new Skill("S2", 3);
        Skill s3 = new Skill("S3", 1);
        ProfilePrototype profilePrototype = new ProfilePrototype(new HashSet<>(), "Test");
        Profile p = new Profile();
        p.getSkills().add(s1);
        p.getSkills().add(s2);
        p.getSkills().add(s3);
        ProfileClusterable profileClusterable = new ProfileClusterable(p);
        profilePrototype.addClusterable(profileClusterable);
        List<ProfileClusterable> list = (List<ProfileClusterable>) ReflectionTestUtils.getField(profilePrototype, "profileClusterables");
        assertThat(list.size()).isEqualTo(1);
    }

    private SkillWrapper sw(Skill s) {
        return new SkillWrapper(s);
    }

    @Test
    public void evaluate() throws Exception {
        // Intersecting skills; Expected in all profiles.
        Skill s1 = new Skill("S1", 4);
        Skill s2 = new Skill("S2", 3);

        Skill s3 = new Skill("S3", 1);
        Skill s4 = new Skill("S4", 1);
        Skill s5 = new Skill("S5", 1);
        Skill s6 = new Skill("S6", 3);
        Profile p1 = new Profile();
        p1.getSkills().add(s1);
        p1.getSkills().add(s2);
        p1.getSkills().add(s3);
        p1.getSkills().add(s4);

        Profile p2 = new Profile();
        p2.getSkills().add(s1);
        p2.getSkills().add(s2);
        p2.getSkills().add(s6);
        p2.getSkills().add(s4);

        Profile p3 = new Profile();
        p3.getSkills().add(s1);
        p3.getSkills().add(s2);
        p3.getSkills().add(s3);
        p3.getSkills().add(s5);

        Profile p4 = new Profile();
        p4.getSkills().add(s1);
        p4.getSkills().add(s2);
        p4.getSkills().add(s6);
        p4.getSkills().add(s5);
        p4.getSkills().add(s3);
        p4.getSkills().add(s4);

        ProfileClusterable pc1 = new ProfileClusterable(p1);
        ProfileClusterable pc2 = new ProfileClusterable(p2);
        ProfileClusterable pc3 = new ProfileClusterable(p3);
        ProfileClusterable pc4 = new ProfileClusterable(p4);

        ProfilePrototype prototype = new ProfilePrototype(new HashSet<>(), "Test");
        prototype.addClusterable(pc1);
        prototype.addClusterable(pc2);
        prototype.addClusterable(pc3);
        prototype.addClusterable(pc4);

        ProfilePrototype result = prototype.evaluate();

        // Make sure the prototype is calculated correctly
        assertThat(result.getValues().size()).isEqualTo(2);
        assertThat(result.getValues()).containsExactlyInAnyOrder(new SkillWrapper(s1), new SkillWrapper(s2));
        // Make sure the original hash set havn't been touched;
        assertThat(p4.getSkills()).containsExactlyInAnyOrder(s1, s2, s3, s4, s5, s6);
        assertThat(p3.getSkills()).containsExactlyInAnyOrder(s1, s2, s3, s5);
        assertThat(p2.getSkills()).containsExactlyInAnyOrder(s1, s2, s4, s6);
        assertThat(p1.getSkills()).containsExactlyInAnyOrder(s1, s2, s3, s4);

        assertThat(pc1.getValues()).containsExactlyInAnyOrder(sw(s1), sw(s2), sw(s3), sw(s4));
        assertThat(pc2.getValues()).containsExactlyInAnyOrder(sw(s1), sw(s2), sw(s4), sw(s6));
        assertThat(pc3.getValues()).containsExactlyInAnyOrder(sw(s1), sw(s2), sw(s3), sw(s5));
        assertThat(pc4.getValues()).containsExactlyInAnyOrder(sw(s1), sw(s2), sw(s3), sw(s4), sw(s5), sw(s6));

    }
}
