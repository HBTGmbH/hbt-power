package de.hbt.power.service;

import de.hbt.power.client.SkillUsageClient;
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
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;
import java.util.stream.Collectors;

import static de.hbt.power.service.housekeeping.HousekeepingService.UNUSED_CUSTOM_SKILLS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Housekeeping, rubric unused (#288): own skills no profile uses, never skills of the tree
 */
@SpringBootTest
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class UnusedCustomSkillsITest {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private SkillUsageClient skillUsageClient;

    private MockMvc mockMvc;

    private SkillCategory other;

    @Before
    public void setUp() {
        mockMvc = webAppContextSetup(webApplicationContext).build();
        skillRepository.deleteAll();
        other = skillCategoryRepository.findOneByQualifier("Other")
                .orElseGet(() -> skillCategoryRepository.save(SkillCategory.of("Other")));
        custom("Eigener ungenutzt");
        custom("Eigener genutzt");
        custom("Eigener per Alias genutzt", "EpA");
        skill("Baum ungenutzt", false);
        skill("Java", false);
        when(skillUsageClient.findSkillUsage()).thenReturn(Map.of("Java", 3, "eigener GENUTZT", 1, "epa", 1, "Zuletzt", 0));
    }

    @After
    public void cleanUp() {
        skillRepository.deleteAll();
    }

    private Skill custom(String name, String... aliases) {
        Skill skill = Skill.of(name);
        skill.getAliases().addAll(java.util.Arrays.asList(aliases));
        skill.setCustom(true);
        skill.setCategory(other);
        return skillRepository.save(skill);
    }

    private void skill(String name, boolean custom) {
        Skill skill = Skill.of(name);
        skill.setCustom(custom);
        skill.setCategory(other);
        skillRepository.save(skill);
    }

    private java.util.List<String> names() {
        return skillRepository.findAll().stream().map(Skill::getQualifier).sorted().collect(Collectors.toList());
    }

    @Test
    public void onlyOwnSkillsNobodyUses_areUnused_byNameAndAliasIgnoringCase() throws Exception {
        mockMvc.perform(get("/admin/housekeeping/unused"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].check").value(UNUSED_CUSTOM_SKILLS))
                .andExpect(jsonPath("$[0].count").value(1))
                .andExpect(jsonPath("$[0].examples", contains("Eigener ungenutzt")))
                .andExpect(jsonPath("$[0].error").value(nullValue()));
    }

    @Test
    public void cleaning_deletesExactlyTheUnusedOwnSkills() throws Exception {
        mockMvc.perform(delete("/admin/housekeeping/unused/" + UNUSED_CUSTOM_SKILLS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        assertThat(names()).containsExactly("Baum ungenutzt", "Eigener genutzt", "Eigener per Alias genutzt", "Java");
    }

    @Test
    public void withoutAnAnswerOfTheProfileService_theCheckFails_andNothingIsDeleted() throws Exception {
        when(skillUsageClient.findSkillUsage()).thenThrow(new ResourceAccessException("Connection refused"));

        mockMvc.perform(get("/admin/housekeeping/unused"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].count").value(0))
                .andExpect(jsonPath("$[0].error", containsString("Connection refused")));
        mockMvc.perform(delete("/admin/housekeeping/unused/" + UNUSED_CUSTOM_SKILLS))
                .andExpect(status().isServiceUnavailable());
        assertThat(names()).hasSize(5);
    }

    @Test
    public void anEmptyUsage_isNoReasonToDeleteEveryOwnSkill() throws Exception {
        when(skillUsageClient.findSkillUsage()).thenReturn(Map.of("Java", 0));

        mockMvc.perform(get("/admin/housekeeping/unused"))
                .andExpect(jsonPath("$[0].error", containsString("no skill in use")));
        mockMvc.perform(delete("/admin/housekeeping/unused/" + UNUSED_CUSTOM_SKILLS))
                .andExpect(status().isServiceUnavailable());
        assertThat(names()).hasSize(5);
    }

    @Test
    public void anUnknownCheck_isNotFound() throws Exception {
        mockMvc.perform(delete("/admin/housekeeping/unused/everything"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void onlyAdmins_reachTheHousekeeping() throws Exception {
        mockMvc.perform(get("/admin/housekeeping/unused").header("X-Pwr-User-Admin", "false"))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/admin/housekeeping/unused/" + UNUSED_CUSTOM_SKILLS).header("X-Pwr-User-Admin", "false"))
                .andExpect(status().isForbidden());
        assertThat(names()).hasSize(5);
    }
}
