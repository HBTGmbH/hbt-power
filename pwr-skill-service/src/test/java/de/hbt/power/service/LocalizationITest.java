package de.hbt.power.service;

import de.hbt.power.model.LocalizedQualifier;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.WebApplicationContext;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Localizations of skills and categories can be saved, replaced and removed (#93).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class LocalizationITest {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private Skill skill;

    private SkillCategory category;

    @Before
    public void setUp() {
        mockMvc = webAppContextSetup(webApplicationContext).build();
        skillRepository.deleteAll();
        if (skillCategoryRepository.findOneByQualifier("Other").isEmpty()) {
            skillCategoryRepository.save(SkillCategory.of("Other"));
        }
        // Several skills and categories first, so that their IDs differ from the IDs of the localizations: with
        // foreign keys in both directions, saving only worked when they happened to match
        IntStream.range(0, 5).forEach(i -> skillRepository.save(Skill.of("Filler " + i)));
        IntStream.range(0, 5).forEach(i -> category("Filler category " + i));
        category = category("Requirements");
        skill = Skill.of("Requirements Engineering");
        skill.setCategory(category);
        skill = skillRepository.save(skill);
    }

    @After
    public void cleanUp() {
        skillRepository.deleteAll();
    }

    private SkillCategory category(String name) {
        return skillCategoryRepository.findOneByQualifier(name)
                .orElseGet(() -> skillCategoryRepository.save(SkillCategory.of(name)));
    }

    /**
     * Reads the stored localizations in an own transaction: the single GET endpoints leave the lazy collection out
     */
    private Map<String, String> storedSkillLocalizations() {
        return transactionTemplate.execute(status -> skillRepository.findById(skill.getId()).get().getQualifiers().stream()
                .collect(Collectors.toMap(LocalizedQualifier::getLocale, LocalizedQualifier::getQualifier)));
    }

    private Map<String, String> storedCategoryLocalizations() {
        return transactionTemplate.execute(status -> skillCategoryRepository.findById(category.getId()).get().getQualifiers().stream()
                .collect(Collectors.toMap(LocalizedQualifier::getLocale, LocalizedQualifier::getQualifier)));
    }

    private Set<String> foreignKeys(String table) throws Exception {
        Set<String> result = new HashSet<>();
        try (Connection connection = dataSource.getConnection();
             ResultSet keys = connection.getMetaData().getImportedKeys(null, null, table)) {
            while (keys.next()) {
                result.add((keys.getString("FKCOLUMN_NAME") + " -> " + keys.getString("PKTABLE_NAME")).toLowerCase());
            }
        }
        return result;
    }

    @Test
    public void joinTables_haveOnlyTheForeignKeysOfTheMapping() throws Exception {
        assertThat(foreignKeys("SKILL_QUALIFIERS"))
                .containsExactlyInAnyOrder("skill_id -> skill", "qualifiers_id -> localized_qualifier");
        assertThat(foreignKeys("SKILL_CATEGORY_QUALIFIERS"))
                .containsExactlyInAnyOrder("qualifiers_id -> skill_category", "skill_category_id -> localized_qualifier");
    }

    @Test
    public void skillLocalization_canBeAddedReplacedAndRemoved() throws Exception {
        mockMvc.perform(post("/admin/skill/{id}/locale/{language}", skill.getId(), "deu").param("qualifier", "Anforderungsanalyse"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/admin/skill/{id}/locale/{language}", skill.getId(), "deu").param("qualifier", "Anforderungsmanagement"))
                .andExpect(status().isOk());

        assertThat(storedSkillLocalizations()).containsOnly(entry("deu", "Anforderungsmanagement"));

        mockMvc.perform(delete("/admin/skill/{id}/locale/{language}", skill.getId(), "deu"))
                .andExpect(status().isOk());

        assertThat(storedSkillLocalizations()).isEmpty();
    }

    @Test
    public void categoryLocalization_canBeAddedReplacedAndRemoved() throws Exception {
        mockMvc.perform(post("/admin/category/{id}/locale", category.getId()).param("lang", "deu").param("qualifier", "Anforderungen"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/admin/category/{id}/locale", category.getId()).param("lang", "deu").param("qualifier", "Anforderungsmanagement"))
                .andExpect(status().isOk());

        assertThat(storedCategoryLocalizations()).containsOnly(entry("deu", "Anforderungsmanagement"));

        mockMvc.perform(delete("/admin/category/{id}/locale/{language}", category.getId(), "deu"))
                .andExpect(status().isOk());

        assertThat(storedCategoryLocalizations()).isEmpty();
    }

    /**
     * The admin skill tree replaces a skill or category with the response; without its localizations it fails (#93)
     */
    @Test
    public void responses_containTheLocalizations() throws Exception {
        mockMvc.perform(post("/admin/skill/{id}/locale/{language}", skill.getId(), "deu").param("qualifier", "Anforderungsmanagement"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/admin/category/{id}/locale", category.getId()).param("lang", "deu").param("qualifier", "Anforderungen"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/skill/{id}", skill.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifiers[0].qualifier").value("Anforderungsmanagement"));
        mockMvc.perform(get("/skill/byName").param("qualifier", "Requirements Engineering"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifiers[0].qualifier").value("Anforderungsmanagement"))
                .andExpect(jsonPath("$.category.qualifiers[0].qualifier").value("Anforderungen"));
        mockMvc.perform(get("/category/{id}", category.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifiers[0].qualifier").value("Anforderungen"));
        mockMvc.perform(patch("/admin/category/{id}/display/{isDisplay}", category.getId(), true))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.display").value(true))
                .andExpect(jsonPath("$.qualifiers[0].qualifier").value("Anforderungen"));
    }

    /**
     * A view profile offers the languages that have localizations (#174); removed ones stay behind without a skill or
     * category and must not count
     */
    @Test
    public void languages_areThoseWithLocalizationsOfSkillsOrCategories() throws Exception {
        mockMvc.perform(get("/skill/locales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code == 'eng')]").isEmpty())
                .andExpect(jsonPath("$[?(@.code == 'fra')]").isEmpty());

        mockMvc.perform(post("/admin/skill/{id}/locale/{language}", skill.getId(), "eng").param("qualifier", "Requirements Engineering"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/admin/category/{id}/locale", category.getId()).param("lang", "fra").param("qualifier", "Exigences"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/skill/locales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code == 'eng')].name").value("Englisch"))
                .andExpect(jsonPath("$[?(@.code == 'fra')].name").value("Französisch"));

        mockMvc.perform(delete("/admin/skill/{id}/locale/{language}", skill.getId(), "eng"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/admin/category/{id}/locale/{language}", category.getId(), "fra"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/skill/locales"))
                .andExpect(jsonPath("$[?(@.code == 'eng')]").isEmpty())
                .andExpect(jsonPath("$[?(@.code == 'fra')]").isEmpty());
    }
}
