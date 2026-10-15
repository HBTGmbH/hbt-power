package de.hbt.power.service;

import de.hbt.power.model.LocalizedQualifier;
import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashSet;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class CategoryServiceIntegrationTest {


    private MockMvc mockMvc;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private CategoryService categoryService;

    private Skill skillToTest;


    @Transactional
    public SkillCategory persistentCatogory(String qualifier) {
        return SkillCategory.of(qualifier);
    }

    @Before
    public void setUp() {
        this.mockMvc = webAppContextSetup(webApplicationContext).build();
        categoryService = new CategoryService(skillCategoryRepository, skillRepository);
        skillToTest = new Skill();
        skillToTest.setQualifier("Test");
    }

    @Test
    @DirtiesContext
    @Transactional
    public void addLocalizationToCategory() {
        SkillCategory skillCategory = SkillCategory.of("Test");
        skillCategory = skillCategoryRepository.save(skillCategory);
        // Add a localization
        categoryService.addLocalizationToCategory(skillCategory, "deu", "Test12");
        SkillCategory localizedCategory = skillCategoryRepository.getOne(skillCategory.getId());
        LocalizedQualifier localizedQualifier = (LocalizedQualifier) localizedCategory.getQualifiers().toArray()[0];
        assertThat(localizedQualifier).isNotNull();
        assertThat(localizedQualifier.getLocale()).isEqualTo(Locale.GERMAN.getISO3Language());
    }

    @Test
    @DirtiesContext
    @Transactional
    public void moveValidCategory() {
        // Build this struture
        // parent1
        // |- child1
        //     |- child2
        //     |- child2_2
        SkillCategory parent1 = SkillCategory.of("Parent1");
        skillCategoryRepository.save(parent1);
        SkillCategory child1 = SkillCategory.of("Child1");
        child1.setCategory(parent1);
        skillCategoryRepository.save(child1);

        SkillCategory child2 = SkillCategory.of("Child2");
        child2.setCategory(child1);
        skillCategoryRepository.save(child2);

        SkillCategory child2_2 = SkillCategory.of("Child2_2");
        child2_2.setCategory(child1);
        skillCategoryRepository.save(child2_2);

        parent1 = skillCategoryRepository.save(parent1);

        // Build to this sturcutre
        // parent1
        // |- child1
        //     |- child2
        //        |- child2_2
        categoryService.moveCategory(child2_2, child2);

        // Update all the entites
        parent1 = skillCategoryRepository.getOne(parent1.getId());
        child1 = skillCategoryRepository.getOne(child1.getId());
        child2 = skillCategoryRepository.getOne(child2.getId());
        child2_2 = skillCategoryRepository.getOne(child2_2.getId());

        // Check the child -> parent relationships
        assertThat(parent1.getCategory()).isNull();
        assertThat(child1.getCategory()).isEqualTo(parent1);
        assertThat(child2.getCategory()).isEqualTo(child1);
        assertThat(child2_2.getCategory()).isEqualTo(child2);
    }

    /**
     * Validates that cyclic tree creation is not possible
     */
    @Test(expected = Exception.class)
    @DirtiesContext
    @Transactional
    public void testMoveCategoryCreateCycle() {
        // Source structure
        // parent1 toMove
        // |- child1
        //     |- child2 nP
        SkillCategory parent1 = SkillCategory.of("Parent1");
        skillCategoryRepository.save(parent1);
        SkillCategory child1 = SkillCategory.of("Child1", parent1);
        skillCategoryRepository.save(child1);
        SkillCategory child2 = SkillCategory.of("Child2", child1);
        skillCategoryRepository.save(child2);
        // Target structure that would not be allowed (cycle)
        // parent1
        // |- child1
        //     |- child2 nP
        //        |- parent1 toMove
        categoryService.moveCategory(parent1, child2);

    }


    @Test
    @DirtiesContext
    @Transactional
    public void testDeleteCategory() {
        // Source
        /*
        cat1
        |-skill1
        |-cat2
            |-cat3
            |-skill2
                |-cat4

         */

        SkillCategory cat1 = SkillCategory.of("Cat1");
        skillCategoryRepository.save(cat1);
        SkillCategory cat2 = SkillCategory.of("Cat2", cat1);
        skillCategoryRepository.save(cat2);
        SkillCategory cat3 = SkillCategory.of("Cat3", cat2);
        skillCategoryRepository.save(cat3);
        SkillCategory cat4 = SkillCategory.of("Cat4", cat3);
        skillCategoryRepository.save(cat4);

        Skill skill1 = new Skill("Skill1", new HashSet<>(), cat1);
        skillRepository.save(skill1);
        Skill skill2 = new Skill("Skill2", new HashSet<>(), cat2);
        skillRepository.save(skill2);

        categoryService.deleteCategory(cat2);

        // Result
        /*

        cat1

         */
        assertThat(skillCategoryRepository.findAll()).contains(cat1);
        assertThat(skillCategoryRepository.findAll()).doesNotContain(cat2);
        assertThat(skillCategoryRepository.count()).isEqualTo(1);

        assertThat(skillRepository.findAll()).contains(skill1);
        assertThat(skillRepository.findAll()).doesNotContain(skill2);
        assertThat(skillRepository.count()).isEqualTo(1);


    }
}
