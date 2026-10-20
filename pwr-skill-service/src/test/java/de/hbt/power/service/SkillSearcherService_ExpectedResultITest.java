package de.hbt.power.service;

import de.hbt.power.repo.SkillRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import de.hbt.power.model.Skill;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class SkillSearcherService_ExpectedResultITest {

    /**
     * Skills the searches should find, plus short names with a similar spelling that must not push them out
     */
    private static final String[] SKILLS = {
            "Java", "Java 8", "JavaScript", "Unity", "Kotlin", "Angular", "Kubernetes", "Spring", "Spring Boot",
            "C", "C#", "C++", ".NET", "ASP.NET Core", "Go", "Godot", "Argo CD", "Argus", "Mango", "Cube", "Tube",
            "Kupfer", "Range", "Qualitätssicherung", "JSON", "JSTL"
    };

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillSearcherService skillSearcherService;

    private void persistentSkill(String name) {
        skillRepository.save(Skill.of(name));
    }

    @Before
    public void setUp() throws Exception {
        skillRepository.deleteAll();
        for (String skill : SKILLS) {
            persistentSkill(skill);
        }
        Skill jira = Skill.of("Atlassian JIRA");
        jira.addLocale(Locale.GERMAN, "Jira");
        skillRepository.save(jira);
        Skill subversion = Skill.of("Apache Subversion");
        subversion.addLocale(Locale.GERMAN, "SVN");
        skillRepository.save(subversion);
        skillWithAliases("PostgreSQL", "Postgres", "PSQL");
        skillWithAliases("Microsoft Azure", "MS Azure", "Azure Cloud");
        // a word start in an alias of another skill must not outrank the same word start in a name
        skillWithAliases("Lens", "Kubernetes Lens", "Kubernetes IDE");
        skillWithAliases("Google Kubernetes Engine (GKE)", "GKE", "Google Kubernetes");
        Skill kubernetes = skillRepository.findOneByQualifier("Kubernetes").get();
        kubernetes.getAliases().add("K8S");
        skillRepository.save(kubernetes);
        // Many aliases must not push a skill down: Java stays ahead of JavaScript for "Jav"
        Skill java = skillRepository.findOneByQualifier("Java").get();
        java.getAliases().addAll(Arrays.asList("J2SE", "Java SE", "Java 11", "Java 17", "java8"));
        skillRepository.save(java);
        Skill javaScript = skillRepository.findOneByQualifier("JavaScript").get();
        // with a trailing space, as in profiles
        javaScript.getAliases().add("JS ");
        skillRepository.save(javaScript);
        skillSearcherService.buildSearchIndexSync();
    }

    @Test
    public void shouldFindByWordStart() {
        shouldFindFirst("Jav", "Java");
        shouldFindFirst("java", "Java");
        shouldFindFirst("jAv", "Java");
        shouldFindFirst("Ja", "Java");
        shouldFindFirst("J", "Java");
        shouldFindFirst("Kotl", "Kotlin");
        shouldFindFirst("Uni", "Unity");
        assertThat(search("Jav").subList(0, 3)).contains("Java", "JavaScript");
    }

    @Test
    public void shouldPutExactMatchFirst() {
        shouldFindFirst("Java", "Java");
        shouldFindBefore("Java", "Java", "JavaScript", "Java 8");
        shouldFindFirst("spring", "Spring");
        shouldFindFirst("go", "Go");
    }

    @Test
    public void shouldNotLetSimilarShortNamesPushOutWordStarts() {
        shouldFindFirst("Angu", "Angular");
        shouldFindFirst("Kuber", "Kubernetes");
        shouldFindFirst("Kube", "Kubernetes");
        assertThat(search("Kuber")).doesNotContain("Cube", "Tube", "Kupfer");
        assertThat(search("Angu")).doesNotContain("Mango", "Argus", "Range", "Argo CD");
    }

    @Test
    public void shouldRequireEveryWordAsWordStart() {
        shouldFindFirst("Spring Bo", "Spring Boot");
        assertThat(search("Spring Bo")).doesNotContain("Go", "Godot");
        shouldFindFirst("SpringBoot", "Spring Boot");
        shouldFindFirst("boot", "Spring Boot");
    }

    @Test
    public void shouldKeepTermsWithSpecialCharacters() {
        shouldFindFirst("C++", "C++");
        shouldFindBefore("C++", "C++", "C#", "C");
        shouldFindFirst("C#", "C#");
        shouldFindBefore("C#", "C#", "C++", "C");
        shouldFindFirst(".NET", ".NET");
        assertThat(search(".NET")).contains("ASP.NET Core");
    }

    @Test
    public void shouldFindTypos() {
        shouldFindFirst("Kubernets", "Kubernetes");
        shouldFindFirst("Angluar", "Angular");
        shouldFindFirst("Kotiln", "Kotlin");
    }

    @Test
    public void shouldFindByLocalization() {
        shouldFindFirst("jir", "Atlassian JIRA");
        shouldFindFirst("Jira", "Atlassian JIRA");
        shouldFindFirst("svn", "Apache Subversion");
    }

    @Test
    public void shouldFindByAlias() {
        shouldFindFirst("K8S", "Kubernetes");
        shouldFindFirst("k8s", "Kubernetes");
        shouldFindFirst("Postgres", "PostgreSQL");
        shouldFindFirst("psql", "PostgreSQL");
    }

    @Test
    public void shouldNotMatchByASingleLetterOfASplitWord() {
        // K8S splits into k, 8 and s, C++ into c: Kotlin or Kupfer start with k, Cube with c
        assertThat(search("K8S")).containsExactly("Kubernetes");
        assertThat(search("C++")).doesNotContain("Cube", "Kupfer");
        // the 8 alone is no similar spelling of the 8 in K8S
        assertThat(search("java8")).doesNotContain("Kubernetes");
    }

    @Test
    public void shouldFindByWordStartOfAlias() {
        shouldFindFirst("K8", "Kubernetes");
        shouldFindFirst("Postg", "PostgreSQL");
        shouldFindFirst("MS Az", "Microsoft Azure");
    }

    @Test
    public void shouldFindTyposInAlias() {
        shouldFindFirst("Postgers", "PostgreSQL");
    }

    @Test
    public void shouldPutAWordStartInTheNameBeforeOneInAnAlias() {
        shouldFindFirst("Kuber", "Kubernetes");
        shouldFindFirst("Kube", "Kubernetes");
        shouldFindBefore("Kubernetes", "Kubernetes", "Lens", "Google Kubernetes Engine (GKE)");
    }

    @Test
    public void shouldPutExactAliasFirst() {
        shouldFindFirst("JS", "JavaScript");
        shouldFindFirst("Java SE", "Java");
        shouldFindFirst("java 11", "Java");
        shouldFindFirst("Azure Cloud", "Microsoft Azure");
    }

    @Test
    public void shouldSuggestOnlyTheCanonicalName() {
        assertThat(search("K8S")).doesNotContain("K8S");
        assertThat(search("Postgres")).doesNotContain("Postgres", "PSQL");
    }

    @Test
    public void shouldReturnASkillOnce_whenNameAndAliasesMatch() {
        assertThat(search("Azure")).containsOnlyOnce("Microsoft Azure");
        assertThat(search("Postgre")).containsOnlyOnce("PostgreSQL");
    }

    @Test
    public void shouldIgnoreAccents() {
        shouldFindFirst("qualitatssicherung", "Qualitätssicherung");
        shouldFindFirst("Qualitäts", "Qualitätssicherung");
    }

    @Test
    public void shouldReturnEachSkillOnce() {
        List<String> results = search("Jira");
        assertThat(results).doesNotHaveDuplicates();
    }

    @Test
    public void shouldReturnNothingForBlankInput() {
        assertThat(search("")).isEmpty();
        assertThat(search("   ")).isEmpty();
    }

    private void skillWithAliases(String name, String... aliases) {
        Skill skill = Skill.of(name);
        skill.getAliases().addAll(Arrays.asList(aliases));
        skillRepository.save(skill);
    }

    private List<String> search(String query) {
        return skillSearcherService.searchSkill(query, 10);
    }

    private void shouldFindFirst(String query, String expected) {
        List<String> results = search(query);
        assertThat(results).as("Results for '%s': %s", query, results).isNotEmpty();
        assertThat(results.get(0)).as("First result for '%s': %s", query, results).isEqualTo(expected);
    }

    private void shouldFindBefore(String query, String first, String... later) {
        List<String> results = search(query);
        for (String other : later) {
            int laterIndex = results.indexOf(other);
            if (laterIndex >= 0) {
                assertThat(results.indexOf(first)).as("'%s' before '%s' for '%s': %s", first, other, query, results)
                        .isBetween(0, laterIndex - 1);
            }
        }
    }
}
