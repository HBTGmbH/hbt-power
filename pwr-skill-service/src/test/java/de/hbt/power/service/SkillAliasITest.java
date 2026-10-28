package de.hbt.power.service;

import de.hbt.power.model.LocalizedQualifier;
import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.model.dto.SkillSuggestion;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import javax.persistence.EntityManagerFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class SkillAliasITest {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private SkillSearcherService skillSearcherService;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    private MockMvc mockMvc;

    private SkillCategory containers;

    private Skill kubernetes;

    @Before
    public void setUp() {
        mockMvc = webAppContextSetup(webApplicationContext).build();
        skillRepository.deleteAll();
        if (skillCategoryRepository.findOneByQualifier("Other").isEmpty()) {
            skillCategoryRepository.save(SkillCategory.of("Other"));
        }
        containers = skillCategoryRepository.findOneByQualifier("Containers")
                .orElseGet(() -> skillCategoryRepository.save(SkillCategory.of("Containers")));
        kubernetes = skill("Kubernetes", containers);
    }

    @After
    public void cleanUp() {
        skillRepository.deleteAll();
    }

    private Skill skill(String name, SkillCategory category, String... versions) {
        Skill skill = Skill.of(name);
        skill.setCategory(category);
        skill.getVersions().addAll(java.util.Arrays.asList(versions));
        return skillRepository.save(skill);
    }

    private void addAlias(Skill skill, String alias) throws Exception {
        mockMvc.perform(post("/admin/skill/{id}/alias", skill.getId()).param("alias", alias))
                .andExpect(status().isOk());
    }

    @Test
    public void byName_withAliasInAnyCase_returnsCanonicalSkill() throws Exception {
        addAlias(kubernetes, "K8S");

        mockMvc.perform(get("/skill/byName").param("qualifier", "k8s"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value("Kubernetes"))
                .andExpect(jsonPath("$.category.qualifier").value("Containers"))
                .andExpect(jsonPath("$.aliases[0]").value("K8S"));
    }

    @Test
    public void categorize_withAlias_returnsCategoryOfCanonicalSkill_andCreatesNoSkill() throws Exception {
        addAlias(kubernetes, "K8S");
        long skillCount = skillRepository.count();

        mockMvc.perform(post("/skill").param("qualifier", "K8S"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value("Containers"));

        assertThat(skillRepository.count()).isEqualTo(skillCount);
        assertThat(skillRepository.findOneByQualifier("K8S")).isEmpty();
    }

    @Test
    public void addAlias_thatIsTheNameOfAnotherSkill_isRejected() throws Exception {
        skill("Docker", containers);

        mockMvc.perform(post("/admin/skill/{id}/alias", kubernetes.getId()).param("alias", "docker"))
                .andExpect(status().isConflict());
    }

    @Test
    public void addAlias_thatIsAnAliasOfAnotherSkill_isRejected() throws Exception {
        Skill openShift = skill("Red Hat OpenShift", containers);
        addAlias(openShift, "OpenShift");

        mockMvc.perform(post("/admin/skill/{id}/alias", kubernetes.getId()).param("alias", "openshift"))
                .andExpect(status().isConflict());
    }

    @Test
    public void addAlias_twice_keepsOneAlias() throws Exception {
        addAlias(kubernetes, "K8S");
        addAlias(kubernetes, "k8s");

        assertThat(skillRepository.findById(kubernetes.getId()).get().getAliases()).containsExactly("K8S");
    }

    @Test
    public void removeAlias_removesIt() throws Exception {
        addAlias(kubernetes, "K8S");

        mockMvc.perform(delete("/admin/skill/{id}/alias", kubernetes.getId()).param("alias", "k8s"))
                .andExpect(status().isOk());

        assertThat(skillRepository.findById(kubernetes.getId()).get().getAliases()).isEmpty();
        mockMvc.perform(get("/skill/byName").param("qualifier", "K8S")).andExpect(status().isNoContent());
    }

    @Test
    public void createSkill_withTheNameOfAnAlias_isRejected() throws Exception {
        addAlias(kubernetes, "K8S");

        mockMvc.perform(post("/admin/skill/category/{id}", containers.getId())
                .contentType("application/json")
                .content("{\"qualifier\": \"K8S\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    public void merge_movesNameAliasesAndVersionsToTarget_andDeletesSource() throws Exception {
        Skill java = skill("Java", containers, "11");
        Skill java8 = skill("Java 8", null, "8u202");
        addAlias(java8, "java8");

        mockMvc.perform(post("/admin/skill/merge").param("source", "Java 8").param("target", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value("Java"));

        assertThat(skillRepository.findById(java8.getId())).isEmpty();
        Skill merged = skillRepository.findById(java.getId()).get();
        assertThat(merged.getAliases()).containsExactlyInAnyOrder("Java 8", "java8");
        assertThat(merged.getVersions()).containsExactlyInAnyOrder("11", "8u202");
        mockMvc.perform(get("/skill/byName").param("qualifier", "JAVA8"))
                .andExpect(jsonPath("$.qualifier").value("Java"));
    }

    @Test
    public void merge_twice_changesNothing() throws Exception {
        skill("K8S", null);
        mockMvc.perform(post("/admin/skill/merge").param("source", "K8S").param("target", "Kubernetes"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/admin/skill/merge").param("source", "K8S").param("target", "Kubernetes"))
                .andExpect(status().isOk());

        assertThat(skillRepository.findAll()).extracting(Skill::getQualifier).containsExactly("Kubernetes");
        assertThat(skillRepository.findById(kubernetes.getId()).get().getAliases()).containsExactly("K8S");
    }

    @Test
    public void merge_withSourceThatIsNoSkill_addsItAsAlias() throws Exception {
        mockMvc.perform(post("/admin/skill/merge").param("source", "Kubernetes Engine").param("target", "Kubernetes"))
                .andExpect(status().isOk());

        assertThat(skillRepository.findById(kubernetes.getId()).get().getAliases()).containsExactly("Kubernetes Engine");
    }

    @Test
    public void merge_withSourceThatIsAnAliasOfAnotherSkill_isRejected() throws Exception {
        Skill openShift = skill("Red Hat OpenShift", containers);
        addAlias(openShift, "OpenShift");

        mockMvc.perform(post("/admin/skill/merge").param("source", "OpenShift").param("target", "Kubernetes"))
                .andExpect(status().isConflict());
    }

    @Test
    public void merge_withUnknownTarget_isNotFound() throws Exception {
        mockMvc.perform(post("/admin/skill/merge").param("source", "Kubernetes").param("target", "Nomad"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void merge_intoItself_isRejected() throws Exception {
        mockMvc.perform(post("/admin/skill/merge").param("source", "Kubernetes").param("target", "Kubernetes"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void merge_withSourceThatDiffersOnlyInCase_keepsTheTargetAsItIs() throws Exception {
        Skill dotNet = skill(".NET", containers, "8");
        addAlias(dotNet, ".NET Core");

        mockMvc.perform(post("/admin/skill/merge").param("source", ".Net").param("target", ".NET"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value(".NET"));

        Skill kept = skillRepository.findById(dotNet.getId()).orElseThrow(AssertionError::new);
        assertThat(kept.getCategory().getQualifier()).isEqualTo("Containers");
        assertThat(kept.getAliases()).containsExactly(".NET Core");
        assertThat(kept.getVersions()).containsExactly("8");
    }

    @Test
    public void merge_withTargetThatDiffersOnlyInCase_returnsTheSkillOfTheTree() throws Exception {
        Skill dotNet = skill(".NET", containers);

        mockMvc.perform(post("/admin/skill/merge").param("source", ".NET").param("target", ".Net"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value(".NET"));

        assertThat(skillRepository.findById(dotNet.getId()).orElseThrow(AssertionError::new).getAliases()).isEmpty();
    }

    @Test
    public void merge_withSourceThatIsAnAliasOfTheTarget_changesNothing() throws Exception {
        addAlias(kubernetes, "K8S");

        mockMvc.perform(post("/admin/skill/merge").param("source", "k8s").param("target", "Kubernetes"))
                .andExpect(status().isOk());

        assertThat(skillRepository.findAll()).extracting(Skill::getQualifier).containsExactly("Kubernetes");
        assertThat(skillRepository.findById(kubernetes.getId()).get().getAliases()).containsExactly("K8S");
    }

    @Test
    public void merge_removesSourceFromSearch() throws Exception {
        skill("Kubernetes Lens", null);
        skillSearcherService.buildSearchIndexSync();
        assertThat(skillSearcherService.searchSkill("Kubernetes", 10)).contains("Kubernetes Lens");

        mockMvc.perform(post("/admin/skill/merge").param("source", "Kubernetes Lens").param("target", "Kubernetes"))
                .andExpect(status().isOk());

        assertThat(skillSearcherService.searchSkill("Kubernetes", 10)).containsExactly("Kubernetes");
    }

    @Test
    public void search_findsNewAliasAtOnce_andNoLongerARemovedOne() throws Exception {
        assertThat(skillSearcherService.searchSkill("Steuermann", 10)).isEmpty();

        addAlias(kubernetes, "Steuermann");
        assertThat(skillSearcherService.searchSkill("Steuermann", 10)).containsExactly("Kubernetes");

        mockMvc.perform(delete("/admin/skill/{id}/alias", kubernetes.getId()).param("alias", "Steuermann"))
                .andExpect(status().isOk());
        assertThat(skillSearcherService.searchSkill("Steuermann", 10)).isEmpty();
    }

    @Test
    public void search_findsTheTargetByTheNameOfAMergedSkill() throws Exception {
        skill("Kubernetes Lens", null);
        mockMvc.perform(post("/admin/skill/merge").param("source", "Kubernetes Lens").param("target", "Kubernetes"))
                .andExpect(status().isOk());

        assertThat(skillSearcherService.searchSkill("Lens", 10)).containsExactly("Kubernetes");
    }

    @Test
    public void suggestions_endpoint_returnsNameAndMatchingAlias() throws Exception {
        addAlias(kubernetes, "Steuermann");

        mockMvc.perform(get("/skill/suggestions").param("searchterm", "steuermann").param("maxResults", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Kubernetes"))
                .andExpect(jsonPath("$[0].matchingAlias").value("Steuermann"));
        mockMvc.perform(get("/skill/suggestions").param("searchterm", "Kubernetes").param("maxResults", "5"))
                .andExpect(jsonPath("$[0].name").value("Kubernetes"))
                .andExpect(jsonPath("$[0].matchingAlias").doesNotExist());
    }

    @Test
    public void suggestions_showAChangedAliasAtOnce() throws Exception {
        addAlias(kubernetes, "Steuermann");
        assertThat(skillSearcherService.suggestSkills("steuermann", 5))
                .extracting(SkillSuggestion::getMatchingAlias).containsExactly("Steuermann");

        mockMvc.perform(delete("/admin/skill/{id}/alias", kubernetes.getId()).param("alias", "Steuermann"))
                .andExpect(status().isOk());
        addAlias(kubernetes, "Steuerrad");

        assertThat(skillSearcherService.suggestSkills("steuerrad", 5))
                .extracting(SkillSuggestion::getMatchingAlias).containsExactly("Steuerrad");
    }

    @Test
    public void suggestions_readNoDatabase() throws Exception {
        addAlias(kubernetes, "Steuermann");
        Statistics statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.setStatisticsEnabled(true);
        try {
            statistics.clear();
            assertThat(skillSearcherService.suggestSkills("steuermann", 5))
                    .extracting(SkillSuggestion::getMatchingAlias).containsExactly("Steuermann");
            assertThat(statistics.getPrepareStatementCount()).isZero();
        } finally {
            statistics.setStatisticsEnabled(false);
        }
    }

    @Test
    public void suggestions_atTheSameTime_allSucceed() throws Exception {
        for (int i = 0; i < 20; i++) {
            skill("Kube Tool " + i, containers);
        }
        skillSearcherService.buildSearchIndexSync();
        ExecutorService executor = Executors.newFixedThreadPool(8);
        try {
            List<Future<List<SkillSuggestion>>> results = new ArrayList<>();
            for (int i = 0; i < 400; i++) {
                String searchTerm = i % 2 == 0 ? "Kube" : "Tool " + (i % 20);
                results.add(executor.submit(() -> skillSearcherService.suggestSkills(searchTerm, 20)));
            }
            for (Future<List<SkillSuggestion>> result : results) {
                assertThat(result.get(30, TimeUnit.SECONDS)).isNotEmpty();
            }
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    public void tree_containsAliases() throws Exception {
        addAlias(kubernetes, "K8S");

        mockMvc.perform(get("/skill/tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.childCategories[?(@.qualifier == 'Containers')].childSkills[0].aliases[*]",
                        containsInAnyOrder("K8S")));
    }

    @Test
    public void rename_makesTheOldNameAnAlias_andKeepsVersionsLocalizationsAndCategory() throws Exception {
        Skill k8s = skill("K8s Engine", containers, "1.29");
        k8s.addLocale(java.util.Locale.GERMAN, "K8s-Maschine");
        skillRepository.save(k8s);

        mockMvc.perform(post("/admin/skill/rename").param("name", "k8s engine").param("newName", " Kubernetes Engine "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qualifier").value("Kubernetes Engine"));

        Skill renamed = skillRepository.findById(k8s.getId()).get();
        assertThat(renamed.getQualifier()).isEqualTo("Kubernetes Engine");
        assertThat(renamed.getAliases()).containsExactly("K8s Engine");
        assertThat(renamed.getVersions()).containsExactly("1.29");
        assertThat(renamed.getQualifiers()).extracting(LocalizedQualifier::getQualifier).containsExactly("K8s-Maschine");
        assertThat(renamed.getCategory().getId()).isEqualTo(containers.getId());
        mockMvc.perform(get("/skill/byName").param("qualifier", "K8S ENGINE"))
                .andExpect(jsonPath("$.qualifier").value("Kubernetes Engine"));
        assertThat(skillSearcherService.searchSkill("Engine", 10)).containsExactly("Kubernetes Engine");
    }

    @Test
    public void rename_inAnotherCase_addsNoAlias() throws Exception {
        mockMvc.perform(post("/admin/skill/rename").param("name", "Kubernetes").param("newName", "KUBERNETES"))
                .andExpect(status().isOk());

        Skill renamed = skillRepository.findById(kubernetes.getId()).get();
        assertThat(renamed.getQualifier()).isEqualTo("KUBERNETES");
        assertThat(renamed.getAliases()).isEmpty();
    }

    @Test
    public void rename_toAnOwnAlias_swapsNameAndAlias() throws Exception {
        addAlias(kubernetes, "K8S");

        mockMvc.perform(post("/admin/skill/rename").param("name", "Kubernetes").param("newName", "k8s"))
                .andExpect(status().isOk());

        Skill renamed = skillRepository.findById(kubernetes.getId()).get();
        assertThat(renamed.getQualifier()).isEqualTo("k8s");
        assertThat(renamed.getAliases()).containsExactly("Kubernetes");
    }

    @Test
    public void rename_toTheNameOfAnotherSkill_isAConflict() throws Exception {
        skill("Docker", containers);

        mockMvc.perform(post("/admin/skill/rename").param("name", "Docker").param("newName", "kubernetes"))
                .andExpect(status().isConflict());

        assertThat(skillRepository.findAll()).extracting(Skill::getQualifier).containsExactlyInAnyOrder("Docker", "Kubernetes");
    }

    @Test
    public void rename_toAnAliasOfAnotherSkill_isAConflict() throws Exception {
        skill("Docker", containers);
        addAlias(kubernetes, "K8S");

        mockMvc.perform(post("/admin/skill/rename").param("name", "Docker").param("newName", "k8s"))
                .andExpect(status().isConflict());
    }

    @Test
    public void rename_withoutName_isRejected_andUnknownSkill_isNotFound() throws Exception {
        mockMvc.perform(post("/admin/skill/rename").param("name", "Kubernetes").param("newName", "  "))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/admin/skill/rename").param("name", "Nomad").param("newName", "HashiCorp Nomad"))
                .andExpect(status().isNotFound());
    }
}
