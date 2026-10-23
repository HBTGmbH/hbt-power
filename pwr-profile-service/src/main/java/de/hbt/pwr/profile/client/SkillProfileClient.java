package de.hbt.pwr.profile.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.skill.SkillCategory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
public class SkillProfileClient {

    /** Name of the category where the skill service puts skills it can't sort (CategoryService) */
    static final String OTHER_CATEGORY = "Other";

    @Value("${pwr-skill-service-url}")
    private String pwrSkillServiceUrl;
    private final RestTemplate restTemplate;

    public SkillProfileClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public SkillCategory updateAndGetCategory(String qualifier) {
        URI uri = UriComponentsBuilder.fromHttpUrl(pwrSkillServiceUrl + "/skill")
                .queryParam("qualifier", "{qualifier}")
                .encode()
                .buildAndExpand(qualifier)
                .toUri();
        return restTemplate.postForEntity(uri, null, SkillCategory.class).getBody();
    }

    /**
     * Reads the skill tree once, without creating anything (unlike {@link #updateAndGetCategory(String)}). Empty if
     * the skill service doesn't answer: the profile check then skips the unsorted skills instead of failing.
     */
    public Optional<SkillTreeIndex> getSkillTreeIndex() {
        try {
            JsonNode root = restTemplate.getForObject(pwrSkillServiceUrl + "/skill/tree", JsonNode.class);
            if (root == null) {
                return Optional.empty();
            }
            Set<String> known = new HashSet<>();
            Set<String> inOther = new HashSet<>();
            Map<String, String> treeNames = new HashMap<>();
            Map<String, String> aliases = new HashMap<>();
            // Other is a top category, directly below the root (##ROOT##)
            for (JsonNode top : root.path("childCategories")) {
                collect(top, known, inOther, OTHER_CATEGORY.equals(top.path("qualifier").asText()), treeNames, aliases);
            }
            // A name of a skill wins over an alias of another one
            aliases.forEach(treeNames::putIfAbsent);
            return Optional.of(new SkillTreeIndex(known, inOther, treeNames));
        } catch (RuntimeException e) {
            log.warn("Skill tree not available, the profile check skips unsorted skills: " + e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Only the skills directly in Other count as unsorted; subcategories of Other are sorted on purpose
     */
    private static void collect(JsonNode category, Set<String> known, Set<String> inOther, boolean isOther,
                                Map<String, String> treeNames, Map<String, String> aliases) {
        for (JsonNode skill : category.path("childSkills")) {
            String treeName = skill.path("qualifier").asText();
            Set<String> names = new HashSet<>();
            names.add(SkillTreeIndex.normalize(treeName));
            treeNames.put(SkillTreeIndex.normalize(treeName), treeName);
            skill.path("aliases").forEach(alias -> {
                names.add(SkillTreeIndex.normalize(alias.asText()));
                aliases.put(SkillTreeIndex.normalize(alias.asText()), treeName);
            });
            known.addAll(names);
            if (isOther) {
                inOther.addAll(names);
            }
        }
        for (JsonNode child : category.path("childCategories")) {
            collect(child, known, inOther, false, treeNames, aliases);
        }
    }

    /**
     * The name of the skill in the tree if <code>name</code> is that name in another case (#208), else
     * <code>name</code>: an alias stays as typed. Also <code>name</code> if the skill service doesn't answer.
     */
    public String treeNameIgnoringCase(String name) {
        try {
            JsonNode skill = restTemplate.getForObject(pwrSkillServiceUrl + "/skill/byName?qualifier={qualifier}",
                    JsonNode.class, name);
            String treeName = skill == null ? null : skill.path("qualifier").asText(null);
            return treeName != null && treeName.equalsIgnoreCase(name) ? treeName : name;
        } catch (RuntimeException e) {
            log.warn("Skill service not available, '" + name + "' stays as typed: " + e.getMessage());
            return name;
        }
    }

    /**
     * Merges skill <code>source</code> into skill <code>target</code> in the skill tree. Errors of the skill service
     * (unknown target, conflicting alias) keep their status.
     *
     * @return the name of the target in the skill tree, which differs from <code>target</code> if that is an alias or
     * written in another case (#207)
     */
    public String mergeSkills(String source, String target) {
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(pwrSkillServiceUrl + "/admin/skill/merge")
                    .queryParam("source", "{source}")
                    .queryParam("target", "{target}")
                    // encodes the values completely, '+' included, which would otherwise arrive as a space
                    .encode()
                    .buildAndExpand(source, target)
                    .toUri();
            JsonNode targetSkill = restTemplate.postForEntity(uri, null, JsonNode.class).getBody();
            return targetSkill == null ? target : targetSkill.path("qualifier").asText(target);
        } catch (HttpStatusCodeException e) {
            throw new WebApplicationException(e.getStatusCode(), messageOf(e));
        }
    }

    /**
     * The message of a skill service error ({"errorType": ..., "message": ...}), else the whole body.
     */
    private static String messageOf(HttpStatusCodeException e) {
        try {
            JsonNode message = new ObjectMapper().readTree(e.getResponseBodyAsString()).get("message");
            if (message != null && message.isTextual()) {
                return message.asText();
            }
        } catch (IOException ignored) {
            // no JSON
        }
        return e.getResponseBodyAsString();
    }
}
