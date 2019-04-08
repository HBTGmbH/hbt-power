package de.hbt.power.service;


import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.model.dto.TCategoryNode;
import de.hbt.power.model.dto.TSkillNode;
import org.junit.Test;

import java.util.HashSet;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;

public class SkillTreeMappingServiceTest {

    @Test
    public void whenGivenCategoriesAndSkills_shouldMapThemToATree() {
        SkillCategory categoryA = new SkillCategory().toBuilder().id(1).qualifier("A").build();
        SkillCategory categoryB = new SkillCategory().toBuilder().id(2).qualifier("B").category(categoryA).build();
        SkillCategory categoryC = new SkillCategory().toBuilder().id(3).qualifier("C").category(categoryB).build();

        Skill s1 = new Skill().toBuilder().category(categoryC).id(20).qualifier("S1").build();
        Skill s2 = new Skill().toBuilder().category(categoryB).id(30).qualifier("S2").build();

        TCategoryNode expectedC = new TCategoryNode().toBuilder().id(3).qualifier("C").build();
        TCategoryNode expectedB = new TCategoryNode().toBuilder().id(2).qualifier("B").build();
        TCategoryNode expectedA = new TCategoryNode().toBuilder().id(1).qualifier("A").build();
        expectedA.getChildCategories().add(expectedB);
        expectedB.getChildCategories().add(expectedC);
        expectedC.getChildSkills().add(new TSkillNode().toBuilder().qualifier("S1").id(20).build());
        expectedB.getChildSkills().add(new TSkillNode().toBuilder().qualifier("S2").id(30).build());

        TCategoryNode expectedRoot = new TCategoryNode().toBuilder().qualifier("##ROOT##").id(-1).build();
        expectedRoot.setChildCategories(new HashSet<>(singletonList(expectedA)));

        SkillTreeMappingService skillTreeMappingService = new SkillTreeMappingService(null, null);
        TCategoryNode result = skillTreeMappingService.buildSkillTree(asList(categoryA, categoryB, categoryC), asList(s1, s2));
        assertThat(result.toString()).isEqualTo(expectedRoot.toString());
    }
}