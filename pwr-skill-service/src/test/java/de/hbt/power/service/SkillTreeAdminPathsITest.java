package de.hbt.power.service;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.WebApplicationContext;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Changes to the skill tree are only reachable under <code>/admin</code>, which the edge restricts to admins (#178).
 * What a consultant does while editing a profile stays outside: a new skill goes into "Other", a version is added.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class SkillTreeAdminPathsITest {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private SkillCategory other;

    private SkillCategory category;

    private SkillCategory target;

    private Skill skill;

    @Before
    public void setUp() {
        mockMvc = webAppContextSetup(webApplicationContext).build();
        skillRepository.deleteAll();
        other = category("Other");
        category = category("Containers");
        target = category("Orchestration");
        skill = Skill.of("Kubernetes");
        skill.setCategory(category);
        skill = skillRepository.save(skill);
    }

    @After
    public void cleanUp() {
        skillRepository.deleteAll();
        skillCategoryRepository.findOneByQualifier("Created").ifPresent(skillCategoryRepository::delete);
    }

    private SkillCategory category(String name) {
        return skillCategoryRepository.findOneByQualifier(name)
                .orElseGet(() -> skillCategoryRepository.save(SkillCategory.of(name)));
    }

    private Set<String> storedVersions() {
        return transactionTemplate.execute(status -> Set.copyOf(skillRepository.findById(skill.getId()).get().getVersions()));
    }

    @Test
    public void treeChanges_areNotReachableOutsideOfAdmin() throws Exception {
        List<RequestBuilder> oldPaths = Arrays.asList(
                post("/category/{parentId}", category.getId()).contentType(MediaType.APPLICATION_JSON).content("{\"qualifier\":\"Created\"}"),
                delete("/category/{id}", target.getId()),
                patch("/category/{id}/category/{parentId}", target.getId(), category.getId()),
                patch("/category/{id}/display/{isDisplay}", category.getId(), true),
                post("/category/{id}/locale", category.getId()).param("lang", "deu").param("qualifier", "Container"),
                delete("/category/{id}/locale/{language}", category.getId(), "deu"),
                post("/skill/category/{categoryId}", category.getId()).contentType(MediaType.APPLICATION_JSON).content("{\"qualifier\":\"Docker\"}"),
                patch("/skill/{id}/category/{categoryId}", skill.getId(), target.getId()),
                delete("/skill/{id}", skill.getId()),
                post("/skill/{id}/locale/{language}", skill.getId(), "deu").param("qualifier", "Kubernetes (Container)"),
                delete("/skill/{id}/locale/{language}", skill.getId(), "deu"),
                delete("/skill/{id}/version", skill.getId()).content("1.30"),
                post("/skill/lucene/index"));
        for (RequestBuilder request : oldPaths) {
            int status = mockMvc.perform(request).andReturn().getResponse().getStatus();
            assertThat(status).as(request.toString()).isIn(404, 405);
        }
        assertThat(skillRepository.findById(skill.getId())).isPresent();
        assertThat(skillRepository.findById(skill.getId()).get().getCategory()).isEqualTo(category);
        assertThat(skillCategoryRepository.findOneByQualifier("Created")).isEmpty();
        assertThat(skillCategoryRepository.findById(target.getId())).isPresent();
    }

    @Test
    public void newSkillOfAProfile_goesIntoOther() throws Exception {
        mockMvc.perform(post("/skill").param("qualifier", "Helm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value("Other"));
        assertThat(skillRepository.findOneByQualifier("Helm").get().getCategory()).isEqualTo(other);
    }

    @Test
    public void versions_areAddedOutsideOfAdmin_andDeletedUnderAdmin() throws Exception {
        mockMvc.perform(post("/skill/{id}/version", skill.getId()).content("1.30"))
                .andExpect(status().isOk());
        assertThat(storedVersions()).containsExactly("1.30");

        mockMvc.perform(delete("/admin/skill/{id}/version", skill.getId()).content("1.30"))
                .andExpect(status().isOk());
        assertThat(storedVersions()).isEmpty();
    }

    @Test
    public void skillWithoutName_isRejected() throws Exception {
        mockMvc.perform(post("/admin/skill/category/{categoryId}", category.getId())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"_qualifier\":\"Docker\"}"))
                .andExpect(status().isBadRequest());
        assertThat(skillRepository.findAll()).extracting(Skill::getQualifier).containsExactly("Kubernetes");
    }

    @Test
    public void treeChanges_workUnderAdmin() throws Exception {
        mockMvc.perform(post("/admin/category/{parentId}", category.getId())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"qualifier\":\"Created\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value("Created"));
        SkillCategory created = skillCategoryRepository.findOneByQualifier("Created").get();

        mockMvc.perform(patch("/admin/category/{id}/category/{parentId}", created.getId(), target.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/admin/category/{id}/display/{isDisplay}", created.getId(), true))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.display").value(true));

        mockMvc.perform(post("/admin/skill/category/{categoryId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"qualifier\":\"Docker\"}"))
                .andExpect(status().isOk());
        Skill docker = skillRepository.findOneByQualifier("Docker").get();
        mockMvc.perform(patch("/admin/skill/{id}/category/{categoryId}", docker.getId(), category.getId()))
                .andExpect(status().isOk());
        assertThat(skillRepository.findById(docker.getId()).get().getCategory()).isEqualTo(category);
        mockMvc.perform(delete("/admin/skill/{id}", docker.getId()))
                .andExpect(status().isNoContent());
        assertThat(skillRepository.findById(docker.getId())).isEmpty();

        mockMvc.perform(post("/admin/skill/lucene/index"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/admin/category/{id}", created.getId()))
                .andExpect(status().isNoContent());
        assertThat(skillCategoryRepository.findOneByQualifier("Created")).isEmpty();
    }
}
