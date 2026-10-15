package de.hbt.power.service;


import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.HashSet;

import static org.assertj.core.api.Assertions.assertThat;


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class SkillServiceTest {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private SkillService skillService;

    @Test
    public void moveSkillToCategory() {
        SkillCategory category1 = SkillCategory.of("Category1");
        skillCategoryRepository.save(category1);
        SkillCategory category2 = SkillCategory.of("Category2");
        skillCategoryRepository.save(category2);

        Skill skill1 = new Skill("Skill1", new HashSet<>(), category2);
        skillRepository.save(skill1);

        skillService.moveSkillToCategory(skill1, category1);

        assertThat(skill1.getCategory()).isEqualTo(category1);
    }

    /**
     * Creates a custom skill; Makes sure that the skill is in the db, has the correct
     * parent and has custom flag set to true
     *
     */
    @Test
    public void createSkillInCategory() {
        SkillCategory skillCategory = SkillCategory.of("Bla Blub");
        skillCategoryRepository.save(skillCategory);

        String qualifier = "createSkillInCategorySkill";
        Skill skill = Skill.of(qualifier);
        skillService.createSkillInCategory(skill, skillCategory);

        Skill retrieved = skillRepository.findOneByQualifier(qualifier).orElse(null);
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getCategory()).isEqualTo(skillCategory);
        assertThat(retrieved.isCustom()).isTrue();
    }

}
