package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.client.SkillTreeIndex;
import de.hbt.pwr.profile.config.ProfileCheckProperties;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfileConfirmationRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.check.*;
import de.hbt.pwr.profile.model.check.ProfileCheckHint.Code;
import de.hbt.pwr.profile.model.check.ProfileCheckHint.Type;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.apache.commons.lang3.BooleanUtils.isFalse;

/**
 * What is missing or outdated in a profile (#139). Thresholds come from {@link ProfileCheckProperties}. Timestamps
 * that didn't exist before #139 (per project, skills) fall back to {@link Profile#getLastEdited()}.
 */
@Service
public class ProfileCheckService {

    private final ConsultantService consultantService;
    private final ConsultantRepository consultantRepository;
    private final ProfileRepository profileRepository;
    private final ProfileConfirmationRepository confirmationRepository;
    private final SkillProfileClient skillProfileClient;
    private final ProfileCheckProperties properties;
    private final Clock clock;

    public ProfileCheckService(ConsultantService consultantService,
                               ConsultantRepository consultantRepository,
                               ProfileRepository profileRepository,
                               ProfileConfirmationRepository confirmationRepository,
                               SkillProfileClient skillProfileClient,
                               ProfileCheckProperties properties,
                               Clock clock) {
        this.consultantService = consultantService;
        this.consultantRepository = consultantRepository;
        this.profileRepository = profileRepository;
        this.confirmationRepository = confirmationRepository;
        this.skillProfileClient = skillProfileClient;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public ProfileCheck check(String initials) {
        Profile profile = consultantService.getProfileByInitials(initials);
        return check(initials, profile, skillProfileClient.getSkillTreeIndex());
    }

    /**
     * "My profile is up to date": resets the outdated hints for their period and is logged
     */
    @Transactional
    public ProfileCheck confirm(String initials, String login, String accountInitials) {
        Profile profile = consultantService.getProfileByInitials(initials);
        LocalDateTime now = LocalDateTime.now(clock);
        confirmationRepository.save(ProfileConfirmation.builder()
                .profileId(profile.getId())
                .confirmedAt(now)
                .login(login)
                .initials(accountInitials)
                .build());
        profile.setLastConfirmed(now);
        profileRepository.save(profile);
        return check(initials, profile, skillProfileClient.getSkillTreeIndex());
    }

    @Transactional
    public List<ProfileConfirmation> confirmations(String initials) {
        Profile profile = consultantService.getProfileByInitials(initials);
        return confirmationRepository.findByProfileIdOrderByConfirmedAtDesc(profile.getId());
    }

    /**
     * One row per active consultant, for the admins' consultant list; reads the skill tree only once
     */
    @Transactional
    public List<ProfileCheckSummary> summaries() {
        Optional<SkillTreeIndex> tree = skillProfileClient.getSkillTreeIndex();
        return consultantRepository.findAll().stream()
                .filter(consultant -> !isFalse(consultant.getActive()) && consultant.getProfile() != null)
                .map(consultant -> summary(consultant, tree))
                .collect(Collectors.toList());
    }

    private ProfileCheckSummary summary(Consultant consultant, Optional<SkillTreeIndex> tree) {
        Profile profile = consultant.getProfile();
        ProfileCheck check = check(consultant.getInitials(), profile, tree);
        LocalDateTime lastChange = latest(Stream.of(check.getLastEdited(), check.getSkillsLastEdited(), check.getProjectsLastEdited()));
        long onlyConfirmed = confirmationRepository.findByProfileIdOrderByConfirmedAtDesc(profile.getId()).stream()
                .filter(confirmation -> lastChange == null || confirmation.getConfirmedAt().isAfter(lastChange))
                .count();
        return ProfileCheckSummary.builder()
                .initials(consultant.getInitials())
                .name(Stream.of(consultant.getFirstName(), consultant.getLastName())
                        .filter(Objects::nonNull).collect(Collectors.joining(" ")))
                .hintCount(check.getHints().size())
                .outdatedCount((int) check.getHints().stream().filter(hint -> hint.getType() == Type.OUTDATED).count())
                .lastEdited(lastChange)
                .lastConfirmed(profile.getLastConfirmed())
                .confirmationsSinceLastChange((int) onlyConfirmed)
                .build();
    }

    ProfileCheck check(String initials, Profile profile, Optional<SkillTreeIndex> tree) {
        LocalDateTime now = LocalDateTime.now(clock);
        LocalDateTime fallback = profile.getLastEdited();
        LocalDateTime skillsLastEdited = profile.getSkillsLastEdited() != null ? profile.getSkillsLastEdited() : fallback;
        LocalDateTime projectsLastEdited = latest(profile.getProjects().stream().map(project -> lastEdited(project, fallback)));

        List<ProfileCheckHint> hints = new ArrayList<>();
        addMissing(profile, hints);
        addEducationWithoutDegree(profile, hints);
        addIncompleteProjects(profile, hints);
        addOutdated(profile, now, fallback, skillsLastEdited, projectsLastEdited, hints);
        tree.ifPresent(index -> addUnsorted(profile, index, hints));

        return ProfileCheck.builder()
                .initials(initials)
                .hints(hints)
                .lastEdited(fallback)
                .skillsLastEdited(skillsLastEdited)
                .projectsLastEdited(projectsLastEdited)
                .lastConfirmed(profile.getLastConfirmed())
                .skillTreeChecked(tree.isPresent())
                .build();
    }

    private void addMissing(Profile profile, List<ProfileCheckHint> hints) {
        String description = profile.getDescription() == null ? "" : profile.getDescription().trim();
        if (description.isEmpty()) {
            hints.add(hint(Type.MISSING, Code.DESCRIPTION_MISSING, ProfileSection.DESCRIPTION).build());
        } else if (description.length() < properties.getMinDescriptionLength()) {
            hints.add(hint(Type.MISSING, Code.DESCRIPTION_SHORT, ProfileSection.DESCRIPTION)
                    .values(values("length", description.length(), "minLength", properties.getMinDescriptionLength()))
                    .build());
        }
        // In the order of the enum, which is the order of the profile page
        Arrays.stream(ProfileSection.values())
                .filter(section -> properties.getRequiredSections().contains(section))
                .filter(section -> isEmpty(profile, section))
                .forEach(section -> hints.add(hint(Type.MISSING, Code.SECTION_EMPTY, section).build()));
    }

    /**
     * The degree stands next to the education in the export (#281); one hint per education without one, by name
     */
    private void addEducationWithoutDegree(Profile profile, List<ProfileCheckHint> hints) {
        profile.getEducation().stream()
                .filter(entry -> entry.getDegree() == null || entry.getDegree().isBlank())
                .map(entry -> entry.getNameEntity() == null ? "" : entry.getNameEntity().getName())
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .forEach(name -> hints.add(hint(Type.INCOMPLETE, Code.EDUCATION_WITHOUT_DEGREE, ProfileSection.EDUCATION)
                        .values(values("education", name))
                        .build()));
    }

    private void addIncompleteProjects(Profile profile, List<ProfileCheckHint> hints) {
        newestFirst(profile.getProjects()).forEach(project -> {
            List<String> reasons = new ArrayList<>();
            int skillCount = project.getSkills() == null ? 0 : project.getSkills().size();
            int descriptionLength = project.getDescription() == null ? 0 : project.getDescription().trim().length();
            if (skillCount < properties.getMinProjectSkills()) {
                reasons.add("FEW_SKILLS");
            }
            if (descriptionLength < properties.getMinProjectDescriptionLength()) {
                reasons.add("SHORT_DESCRIPTION");
            }
            if (project.getProjectRoles() == null || project.getProjectRoles().isEmpty()) {
                reasons.add("NO_ROLE");
            }
            if (!reasons.isEmpty()) {
                hints.add(projectHint(Type.INCOMPLETE, Code.PROJECT_INCOMPLETE, project)
                        .values(values("reasons", reasons,
                                "skillCount", skillCount, "minSkills", properties.getMinProjectSkills(),
                                "descriptionLength", descriptionLength, "minDescriptionLength", properties.getMinProjectDescriptionLength()))
                        .build());
            }
        });
    }

    private void addOutdated(Profile profile, LocalDateTime now, LocalDateTime fallback,
                             LocalDateTime skillsLastEdited, LocalDateTime projectsLastEdited, List<ProfileCheckHint> hints) {
        LocalDateTime confirmed = profile.getLastConfirmed();
        Set<Project> projects = profile.getProjects();
        if (!projects.isEmpty()) {
            // A running project that wasn't saved for long says more than "the references": it links the project
            List<Project> runningOutdated = newestFirst(projects)
                    .filter(project -> project.getEndDate() == null)
                    .filter(project -> isDue(lastEdited(project, fallback), confirmed, now, properties.getRunningProjectMaxAgeMonths()))
                    .collect(Collectors.toList());
            runningOutdated.forEach(project -> hints.add(projectHint(Type.OUTDATED, Code.RUNNING_PROJECT_OUTDATED, project)
                    .since(lastEdited(project, fallback))
                    .values(values("months", properties.getRunningProjectMaxAgeMonths()))
                    .build()));
            if (runningOutdated.isEmpty() && isDue(projectsLastEdited, confirmed, now, properties.getProjectsMaxAgeMonths())) {
                hints.add(hint(Type.OUTDATED, Code.PROJECTS_OUTDATED, ProfileSection.PROJECTS)
                        .since(projectsLastEdited)
                        .values(values("months", properties.getProjectsMaxAgeMonths()))
                        .build());
            }
            addFollowUp(projects, confirmed, now, hints);
        }
        if (!profile.getSkills().isEmpty() && isDue(skillsLastEdited, confirmed, now, properties.getSkillsMaxAgeMonths())) {
            hints.add(hint(Type.OUTDATED, Code.SKILLS_OUTDATED, ProfileSection.SKILLS)
                    .since(skillsLastEdited)
                    .values(values("months", properties.getSkillsMaxAgeMonths()))
                    .build());
        }
    }

    /**
     * The last reference ended a while ago and nothing runs or follows: what about the new project?
     */
    private void addFollowUp(Set<Project> projects, LocalDateTime confirmed, LocalDateTime now, List<ProfileCheckHint> hints) {
        LocalDate today = now.toLocalDate();
        boolean runningOrAhead = projects.stream().anyMatch(project -> project.getEndDate() == null
                || !project.getEndDate().isBefore(today)
                || (project.getStartDate() != null && project.getStartDate().isAfter(today)));
        if (runningOrAhead) {
            return;
        }
        Optional<LocalDate> lastEnd = projects.stream().map(Project::getEndDate).max(Comparator.naturalOrder());
        if (lastEnd.isPresent() && isDue(lastEnd.get().atStartOfDay(), confirmed, now, properties.getFollowUpProjectMonths())) {
            hints.add(hint(Type.OUTDATED, Code.NO_FOLLOW_UP_PROJECT, ProfileSection.PROJECTS)
                    .since(lastEnd.get().atStartOfDay())
                    .values(values("months", properties.getFollowUpProjectMonths()))
                    .build());
        }
    }

    private void addUnsorted(Profile profile, SkillTreeIndex tree, List<ProfileCheckHint> hints) {
        List<String> unsorted = profile.getSkills().stream()
                .map(skill -> skill.getName())
                .filter(tree::isUnsorted)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
        if (!unsorted.isEmpty()) {
            hints.add(hint(Type.UNSORTED, Code.SKILLS_UNSORTED, ProfileSection.SKILLS)
                    .values(values("skills", unsorted))
                    .build());
        }
    }

    /**
     * Due if neither the last change nor a confirmation lies within the period
     */
    private static boolean isDue(LocalDateTime last, LocalDateTime confirmed, LocalDateTime now, int months) {
        LocalDateTime effective = latest(Stream.of(last, confirmed));
        return effective == null || effective.isBefore(now.minusMonths(months));
    }

    private static LocalDateTime lastEdited(Project project, LocalDateTime fallback) {
        return project.getLastEdited() != null ? project.getLastEdited() : fallback;
    }

    private static LocalDateTime latest(Stream<LocalDateTime> times) {
        return times.filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null);
    }

    private static Stream<Project> newestFirst(Collection<Project> projects) {
        return projects.stream().sorted(Comparator.comparing(Project::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())));
    }

    private static boolean isEmpty(Profile profile, ProfileSection section) {
        Collection<?> entries;
        switch (section) {
            case LANGUAGES:
                entries = profile.getLanguages();
                break;
            case QUALIFICATIONS:
                entries = profile.getQualification();
                break;
            case TRAININGS:
                entries = profile.getTrainingEntries();
                break;
            case EDUCATION:
                entries = profile.getEducation();
                break;
            case SECTORS:
                entries = profile.getSectors();
                break;
            case CAREER:
                entries = profile.getCareerEntries();
                break;
            case SPECIAL_FIELDS:
                entries = profile.getSpecialFieldEntries();
                break;
            case SKILLS:
                entries = profile.getSkills();
                break;
            case PROJECTS:
                entries = profile.getProjects();
                break;
            default:
                // the description is checked by its length
                return false;
        }
        return entries == null || entries.isEmpty();
    }

    private static ProfileCheckHint.ProfileCheckHintBuilder hint(Type type, Code code, ProfileSection section) {
        return ProfileCheckHint.builder().type(type).code(code).section(section);
    }

    private static ProfileCheckHint.ProfileCheckHintBuilder projectHint(Type type, Code code, Project project) {
        return hint(type, code, ProfileSection.PROJECTS).projectId(project.getId()).projectName(project.getName());
    }

    private static Map<String, Object> values(Object... keysAndValues) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i + 1 < keysAndValues.length; i += 2) {
            map.put((String) keysAndValues[i], keysAndValues[i + 1]);
        }
        return map;
    }
}
