package de.hbt.power.service.housekeeping;

import de.hbt.power.client.SkillUsageClient;
import de.hbt.power.model.HousekeepingFindings;
import de.hbt.power.model.Skill;
import de.hbt.power.repo.SkillRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Housekeeping of the skill tree, rubric <em>unused</em> (#288): own skills ({@link Skill#isCustom()}, put into the
 * tree by a consultant typing an unknown skill) that no profile and no project uses any more. They are no left-overs
 * but valid entries, so deleting them is a decision of the admin; typing the name again puts the skill back. Skills
 * of the tree that are not custom never count, they are maintained.
 * <p>
 * Who uses which skill only the profile service knows; if it doesn't answer, or knows no skill in use at all, the
 * check reports that instead of findings, so a failure never turns every own skill into an unused one.
 */
@Log4j2
@Service
@Transactional
public class HousekeepingService {

    public static final String UNUSED_CUSTOM_SKILLS = "unused-custom-skills";

    private final SkillRepository skillRepository;
    private final SkillUsageClient skillUsageClient;

    public HousekeepingService(SkillRepository skillRepository, SkillUsageClient skillUsageClient) {
        this.skillRepository = skillRepository;
        this.skillUsageClient = skillUsageClient;
    }

    public List<HousekeepingFindings> checkUnused() {
        try {
            return List.of(HousekeepingFindings.of(UNUSED_CUSTOM_SKILLS, unusedCustomSkills().stream()
                    .map(Skill::getQualifier).collect(Collectors.toList())));
        } catch (RestClientException e) {
            return List.of(HousekeepingFindings.failed(UNUSED_CUSTOM_SKILLS, unavailable(e)));
        }
    }

    /**
     * Deletes what the check finds right now; returns how many
     */
    public int cleanUnused(String check) {
        if (!UNUSED_CUSTOM_SKILLS.equals(check)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No housekeeping check " + check);
        }
        try {
            List<Skill> unused = unusedCustomSkills();
            log.info("Housekeeping " + check + ": deleting skills " + unused.stream()
                    .map(skill -> skill.getQualifier() + " (#" + skill.getId() + ")").collect(Collectors.toList()));
            skillRepository.deleteAll(unused);
            return unused.size();
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, unavailable(e));
        }
    }

    private static String unavailable(RestClientException e) {
        return "Another service did not answer: " + e.getMessage();
    }

    /**
     * Own skills whose name and aliases no profile uses, ignoring case: the profile service counts by the name of the
     * tree, but by the name as typed if it can't reach the tree, so an alias counts too
     */
    private List<Skill> unusedCustomSkills() {
        Map<String, Integer> usage = skillUsageClient.findSkillUsage();
        Set<String> used = usage.entrySet().stream()
                .filter(entry -> entry.getValue() != null && entry.getValue() > 0)
                .map(entry -> entry.getKey().trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        if (used.isEmpty()) {
            // Never all own skills because of an empty answer
            throw new RestClientException("the profile service knows no skill in use");
        }
        return skillRepository.findAll().stream()
                .filter(Skill::isCustom)
                .filter(skill -> Stream.concat(Stream.of(skill.getQualifier()), skill.getAliases().stream())
                        .filter(Objects::nonNull)
                        .noneMatch(name -> used.contains(name.trim().toLowerCase(Locale.ROOT))))
                .sorted(Comparator.comparing(Skill::getQualifier, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }
}
