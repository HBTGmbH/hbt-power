package de.hbt.pwr.profile.client;

import de.hbt.pwr.profile.errors.WebApplicationException;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class SkillProfileClientTest {

    private MockRestServiceServer server;
    private SkillProfileClient client;

    @Before
    public void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        client = new SkillProfileClient(restTemplate);
        ReflectionTestUtils.setField(client, "pwrSkillServiceUrl", "http://skill");
    }

    @Test
    public void mergeSkills_encodesTheNames() {
        server.expect(requestTo("http://skill/admin/skill/merge?source=C%2B%2B%2011&target=C%2B%2B"))
                .andExpect(method(POST))
                .andRespond(withSuccess());

        client.mergeSkills("C++ 11", "C++");

        server.verify();
    }

    @Test
    public void mergeSkills_returnsTheNameOfTheTargetInTheSkillTree() {
        server.expect(requestTo("http://skill/admin/skill/merge?source=.NET&target=.Net"))
                .andRespond(withSuccess("{\"id\": 7, \"qualifier\": \".NET\", \"aliases\": []}", MediaType.APPLICATION_JSON));

        assertThat(client.mergeSkills(".NET", ".Net")).isEqualTo(".NET");
    }

    @Test
    public void updateAndGetCategory_encodesTheName() {
        server.expect(requestTo("http://skill/skill?qualifier=C%23"))
                .andExpect(method(POST))
                .andRespond(withSuccess("{\"qualifier\": \"Programming Languages\"}", MediaType.APPLICATION_JSON));

        client.updateAndGetCategory("C#");

        server.verify();
    }

    @Test
    public void mergeSkills_keepsStatusAndMessageOfTheSkillService() {
        server.expect(requestTo("http://skill/admin/skill/merge?source=OpenShift&target=Kubernetes"))
                .andRespond(withStatus(HttpStatus.CONFLICT).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"id\":7,\"errorType\":\"ERR_ALIAS_CONFLICT\",\"message\":\"'OpenShift' is already an alias\"}"));

        assertThatThrownBy(() -> client.mergeSkills("OpenShift", "Kubernetes"))
                .isInstanceOf(WebApplicationException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessage("'OpenShift' is already an alias");
    }

    @Test
    public void skillTreeIndex_knowsSkillsAndAliasesAndOnlyTheDirectSkillsOfOtherAreUnsorted() {
        server.expect(requestTo("http://skill/skill/tree"))
                .andExpect(method(GET))
                .andRespond(withSuccess("{\"id\": -1, \"qualifier\": \"##ROOT##\", \"childSkills\": [], \"childCategories\": ["
                        + "{\"id\": 1, \"qualifier\": \"Programming Languages\", \"childCategories\": [],"
                        + " \"childSkills\": [{\"qualifier\": \"Java\", \"aliases\": [\"Java SE\"]}]},"
                        + "{\"id\": 2, \"qualifier\": \"Other\","
                        + " \"childSkills\": [{\"qualifier\": \"Zebra-Tool\", \"aliases\": []}],"
                        + " \"childCategories\": [{\"id\": 3, \"qualifier\": \"Sorted below Other\", \"childCategories\": [],"
                        + " \"childSkills\": [{\"qualifier\": \"Ant-Tool\", \"aliases\": []}]}]}"
                        + "]}", MediaType.APPLICATION_JSON));

        SkillTreeIndex index = client.getSkillTreeIndex().orElseThrow(AssertionError::new);

        assertThat(index.isUnsorted("java")).isFalse();
        assertThat(index.isUnsorted(" Java SE ")).isFalse();
        assertThat(index.isUnsorted("Zebra-Tool")).isTrue();
        assertThat(index.isUnsorted("Ant-Tool")).isFalse();
        assertThat(index.isUnsorted("Unknown")).isTrue();
        server.verify();
    }

    @Test
    public void skillTreeIndex_knowsTheTreeNameOfOtherSpellingsAndAliases() {
        server.expect(requestTo("http://skill/skill/tree"))
                .andRespond(withSuccess("{\"qualifier\": \"##ROOT##\", \"childSkills\": [], \"childCategories\": ["
                        + "{\"qualifier\": \"Frameworks\", \"childCategories\": [], \"childSkills\": ["
                        + "{\"qualifier\": \".NET\", \"aliases\": [\".NET Core\"]},"
                        + "{\"qualifier\": \"Spring Framework\", \"aliases\": [\"Spring\"]}]},"
                        + "{\"qualifier\": \"Other\", \"childCategories\": [],"
                        + " \"childSkills\": [{\"qualifier\": \"Spring\", \"aliases\": []}]}"
                        + "]}", MediaType.APPLICATION_JSON));

        SkillTreeIndex index = client.getSkillTreeIndex().orElseThrow(AssertionError::new);

        assertThat(index.treeName(".Net")).isEqualTo(".NET");
        assertThat(index.treeName(" .net core")).isEqualTo(".NET");
        // A name of a skill wins over an alias of another one
        assertThat(index.treeName("spring")).isEqualTo("Spring");
        assertThat(index.treeName("Unknown ")).isEqualTo("Unknown");
    }

    @Test
    public void treeNameIgnoringCase_takesTheSpellingOfTheTree() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=.net"))
                .andRespond(withSuccess("{\"id\": 7, \"qualifier\": \".NET\", \"aliases\": [\".NET Core\"]}", MediaType.APPLICATION_JSON));

        assertThat(client.treeNameIgnoringCase(".net")).isEqualTo(".NET");
    }

    @Test
    public void treeNameIgnoringCase_keepsAnAlias() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=.NET%20Core"))
                .andRespond(withSuccess("{\"id\": 7, \"qualifier\": \".NET\", \"aliases\": [\".NET Core\"]}", MediaType.APPLICATION_JSON));

        assertThat(client.treeNameIgnoringCase(".NET Core")).isEqualTo(".NET Core");
    }

    @Test
    public void treeNameIgnoringCase_keepsTheNameIfTheTreeDoesNotKnowItOrTheSkillServiceFails() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=Unknown"))
                .andRespond(withStatus(HttpStatus.NO_CONTENT));
        server.expect(requestTo("http://skill/skill/byName?qualifier=Other"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertThat(client.treeNameIgnoringCase("Unknown")).isEqualTo("Unknown");
        assertThat(client.treeNameIgnoringCase("Other")).isEqualTo("Other");
    }

    @Test
    public void skillTreeIndex_isEmptyWhenTheSkillServiceFails() {
        server.expect(requestTo("http://skill/skill/tree"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertThat(client.getSkillTreeIndex()).isEmpty();
    }

    @Test
    public void renameSkill_encodesTheNames_andReturnsTheNewNameInTheTree() {
        server.expect(requestTo("http://skill/admin/skill/rename?name=C%2B%2B&newName=C%2B%2B%2020"))
                .andExpect(method(POST))
                .andRespond(withSuccess("{\"id\": 7, \"qualifier\": \"C++ 20\", \"aliases\": [\"C++\"]}", MediaType.APPLICATION_JSON));

        assertThat(client.renameSkill("C++", "C++ 20")).isEqualTo("C++ 20");
        server.verify();
    }

    @Test
    public void renameSkill_keepsStatusAndMessageOfTheSkillService() {
        server.expect(requestTo("http://skill/admin/skill/rename?name=Docker&newName=Kubernetes"))
                .andRespond(withStatus(HttpStatus.CONFLICT).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"id\":7,\"errorType\":\"ERR_SKILL_ALREADY_EXISTS\",\"message\":\"Skill Kubernetes already exists!\"}"));

        assertThatThrownBy(() -> client.renameSkill("Docker", "Kubernetes"))
                .isInstanceOf(WebApplicationException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessage("Skill Kubernetes already exists!");
    }

    @Test
    public void requireTreeSkill_returnsTheSkillOfTheName_inAnyCase() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=kubernetes"))
                .andRespond(withSuccess("{\"id\": 7, \"qualifier\": \"Kubernetes\", \"aliases\": [\"K8S\"]}", MediaType.APPLICATION_JSON));

        assertThat(client.requireTreeSkill("kubernetes").path("id").asLong()).isEqualTo(7);
    }

    @Test
    public void requireTreeSkill_withAnAliasOrAnUnknownName_isNotFound() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=K8S"))
                .andRespond(withSuccess("{\"id\": 7, \"qualifier\": \"Kubernetes\", \"aliases\": [\"K8S\"]}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://skill/skill/byName?qualifier=Nomad"))
                .andRespond(withStatus(HttpStatus.NO_CONTENT));

        assertThatThrownBy(() -> client.requireTreeSkill("K8S"))
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
        assertThatThrownBy(() -> client.requireTreeSkill("Nomad"))
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    public void deleteSkill_deletesItInTheTree() {
        server.expect(requestTo("http://skill/admin/skill/7"))
                .andExpect(method(DELETE))
                .andRespond(withStatus(HttpStatus.NO_CONTENT));

        client.deleteSkill(7);

        server.verify();
    }
}
