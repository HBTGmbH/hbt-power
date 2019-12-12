package de.hbt.power.service;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameter;
import org.junit.runners.Parameterized.Parameters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.web.context.WebApplicationContext;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@RunWith(Parameterized.class)
@ActiveProfiles("test")
public class SkillControllerTest {


    private MockMvc mockMvc;

    // Manually config for spring to use Parameterised
    private TestContextManager testContextManager;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Parameter
    public List<String> skillNames;


    @Parameters(name = "{index}: skillNames {0}")
    public static Collection<Object[]> data() {
        Collection<Object[]> params = new ArrayList<>();
        params.add(new Object[]{Arrays.asList("Java", "Dancing", "Singing")});
        params.add(new Object[]{Arrays.asList("Node.js", "C/C++", "TestSkill123456")});

        return params;
    }


    @Before
    public void setUp() throws Exception {
        this.testContextManager = new TestContextManager(getClass());
        this.testContextManager.prepareTestInstance(this);
        this.mockMvc = webAppContextSetup(webApplicationContext).build();
        if (skillCategoryRepository.findOneByQualifier("Other").isEmpty()) {
            SkillCategory sc = new SkillCategory();
            sc.setQualifier("Other");
            skillCategoryRepository.save(sc);
        }
    }


    @After
    public void cleanUp() {
        skillRepository.deleteAll();
    }

    @Test
    public void testEncodingFindSkillByQualifier() throws Exception {
        for (String skillName : skillNames) {
            Skill s = new Skill();
            s.setQualifier(skillName);
            skillRepository.save(s);
            MockHttpServletRequestBuilder builder = get("/skill/byName");
            builder.param("qualifier", skillName);
            System.out.println("mock: " + mockMvc.toString());
            System.out.println("builder: " + builder.toString());
            mockMvc.perform(builder).andExpect(status().isOk());
        }
    }

    /*
     * Validates that no error 500 is given out when a skill does not exist.
     * Expected:
     * NOT FOUND 404
     */
    @Test
    public void testUpdateAndGetCategoryWithoutPriorExistence() throws Exception {
        for (String skillName : skillNames) {
            Skill s = new Skill();
            s.setQualifier(skillName);
            MockHttpServletRequestBuilder builder = post("/skill");
            builder.param("qualifier", skillName);
            mockMvc.perform(builder).andExpect(status().isOk());
            Optional<Skill> persistent = skillRepository.findOneByQualifier(skillName);
            assertThat(persistent).isPresent();
            skillRepository.deleteAll();
        }
    }

    @Test
    public void testUpdateAndGetCategoryWithPriorExistence() throws Exception {
        for (String skillName : skillNames) {
            Skill s = new Skill();
            s.setQualifier(skillName);
            skillRepository.save(s);
            MockHttpServletRequestBuilder builder = post("/skill");
            builder.param("qualifier", skillName);
            mockMvc.perform(builder).andExpect(status().isOk());
            skillRepository.deleteAll();
        }
    }


}