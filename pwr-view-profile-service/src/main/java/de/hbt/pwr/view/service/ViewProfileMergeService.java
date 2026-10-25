package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.NameEntityType;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.exception.InvalidOwnerException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.entries.ProjectRole;
import de.hbt.pwr.view.model.entries.Qualification;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparable;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static de.hbt.pwr.view.client.profile.model.NameEntityType.*;

@Slf4j
@Service
public class ViewProfileMergeService {

    private final ViewProfileRepository viewProfileRepository;
    private final ViewProfileCreatorService viewProfileCreatorService;
    private final ViewProfileLocalizationService viewProfileLocalizationService;
    private final SkillServiceClient skillServiceClient;
    private final ProfileServiceClient profileServiceClient;


    @Autowired
    public ViewProfileMergeService(ViewProfileRepository viewProfileRepository, ViewProfileCreatorService viewProfileCreatorService,
                                   ViewProfileLocalizationService viewProfileLocalizationService,
                                   SkillServiceClient skillServiceClient, ProfileServiceClient profileServiceClient) {

        this.viewProfileRepository = viewProfileRepository;
        this.viewProfileCreatorService = viewProfileCreatorService;
        this.viewProfileLocalizationService = viewProfileLocalizationService;
        this.skillServiceClient = skillServiceClient;
        this.profileServiceClient = profileServiceClient;
    }

    /**
     * Updates the view profile with the current data of the profile (#332), in place: it keeps its id, name, note,
     * creation date, language and settings, and gets what changed in the profile since, under the current names
     */
    public ViewProfile updateViewProfile(String id, String initials) {
        ViewProfile oldView = viewProfileRepository.findById(id).orElseThrow(() -> new ViewProfileNotFoundException(id));
        // Only an own view profile (#255)
        if (!ViewProfileOperationService.isOwner(oldView, initials)) {
            throw new InvalidOwnerException(id, initials);
        }
        ViewProfileInfo oldInfo = oldView.getViewProfileInfo();
        ViewProfile newView = viewProfileCreatorService.buildViewProfile(initials, oldInfo.getName(),
                oldInfo.getViewDescription(), "", oldView.getLocalization());
        return mergeViewProfiles(oldView, newView);
    }

    /**
     * The new data in the old view profile: under its id, with its name, note and creation date, and its settings
     */
    ViewProfile mergeViewProfiles(ViewProfile oldView, ViewProfile newView) {
        newView.setId(oldView.getId());
        if (oldView.getLocale() != null) {
            newView.setLocale(oldView.getLocale());
        }
        ViewProfileInfo oldInfo = oldView.getViewProfileInfo();
        ViewProfileInfo info = newView.getViewProfileInfo();
        info.setName(oldInfo.getName());
        info.setViewDescription(oldInfo.getViewDescription());
        if (oldInfo.getCreationDate() != null) {
            info.setCreationDate(oldInfo.getCreationDate());
        }
        // Updating counts as use (#289)
        info.setLastUsed(LocalDate.now());
        // Settings of the view profile (#151, #174)
        newView.setShowSkillVersions(oldView.getShowSkillVersions());
        newView.setLocalization(oldView.getLocalization());

        //2. merge old and new VP
        // Profile elements and skills may have been renamed or merged since (#230): an old entry is the new one under
        // its current name, a skill under its name in the skill tree
        FormerNames formerNames = new FormerNames(profileServiceClient.getFormerNames());
        SkillTreeLookup lookup = new SkillTreeLookup(skillServiceClient);

        // ProfileEntries
        newView.setLanguages(mergeEntities(oldView.getLanguages(), newView.getLanguages(), LANGUAGE, formerNames));
        newView.setQualifications(mergeEntities(oldView.getQualifications(), newView.getQualifications(), QUALIFICATION, formerNames));
        newView.setTrainings(mergeEntities(oldView.getTrainings(), newView.getTrainings(), TRAINING, formerNames));
        newView.setEducations(mergeEntities(oldView.getEducations(), newView.getEducations(), EDUCATION, formerNames));
        newView.setSectors(mergeEntities(oldView.getSectors(), newView.getSectors(), SECTOR, formerNames));
        newView.setCareers(mergeEntities(oldView.getCareers(), newView.getCareers(), CAREER, formerNames));
        newView.setKeySkills(mergeEntities(oldView.getKeySkills(), newView.getKeySkills(), SPECIAL_FIELD, formerNames));

        // Projects
        newView.setProjects(mergeProjects(oldView.getProjects(), newView.getProjects(), lookup, formerNames));
        // ProjectRoles
        newView.setProjectRoles(mergeEntities(oldView.getProjectRoles(), newView.getProjectRoles(), PROJECT_ROLE, formerNames));

        // Display Categories
        newView.setDisplayCategories(mergeDisplayCategories(oldView.getDisplayCategories(), newView.getDisplayCategories(), lookup));
        // The old display categories and projects stay; their names come from the current localizations (#174)
        viewProfileLocalizationService.localize(newView);

        return viewProfileRepository.save(newView);
    }

    private List<Project> mergeProjects(List<Project> oldList, List<Project> newList, SkillTreeLookup lookup,
                                        FormerNames formerNames) {
        return newList.stream()
                .map(newProject -> {
                    Optional<Project> maybeOldProject = oldList.stream()
                            .filter(oldProject -> Objects.equals(oldProject.getId(), newProject.getId()))
                            .findAny();
                    return maybeOldProject
                            .map(project -> mergeProject(newProject, project, lookup, formerNames))
                            .orElse(newProject);
                })
                .filter(Objects::nonNull)
                // New projects have no index, they go behind the old ones
                .sorted(Comparator.comparing(newProject -> findIndexIn(oldList, newProject), Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    private Project mergeProject(Project newProject, Project oldProject, SkillTreeLookup lookup, FormerNames formerNames) {
        return newProject.toBuilder()
                .projectRoles(mergeProjectRoles(newProject.getProjectRoles(), oldProject.getProjectRoles(), formerNames))
                .skills(mergeProjectSkills(newProject.getSkills(), oldProject.getSkills(), lookup))
                .enabled(oldProject.getEnabled())
                .build();
    }

    private List<ProjectRole> mergeProjectRoles(List<ProjectRole> newProjectRoles, List<ProjectRole> oldProjectRoles,
                                                FormerNames formerNames) {
        return newProjectRoles.stream()
                .map(newRole -> {
                    List<ProjectRole> oldRoles = oldProjectRoles.stream()
                            .filter(oldRole -> formerNames.isNow(PROJECT_ROLE, oldRole.getName(), newRole.getName()))
                            .collect(Collectors.toList());
                    // Shown if one of them was shown, two roles may have been merged into one
                    Boolean roleActive = oldRoles.isEmpty() || oldRoles.stream().anyMatch(ViewProfileMergeService::isShown);
                    return newRole.toBuilder()
                            .enabled(roleActive)
                            .build();
                })
                .sorted(Comparator.comparing(newRole -> findIndexIn(oldProjectRoles, newRole, formerNames),
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    private List<Skill> mergeProjectSkills(List<Skill> newSkills, List<Skill> oldSkills, SkillTreeLookup lookup) {
        return newSkills.stream()
                .map(newSkill -> {
                    Boolean skillActive = oldSkills.stream()
                            .filter(oldSkill -> Objects.equals(oldSkill.getName(), newSkill.getName()))
                            .findAny()
                            .map(Skill::getEnabled)
                            .orElseGet(() -> enabledUnderTreeName(newSkill, oldSkills, lookup));
                    return newSkill.toBuilder()
                            .enabled(skillActive)
                            .build();
                })
                .sorted(Comparator.comparing(newSkill -> findIndexIn(oldSkills, newSkill), Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    /**
     * Old view profiles kept the names of the profile in the projects, new ones take those of the skill tree (#208):
     * an old <code>.NET Core</code> is the new <code>.NET</code>. Shown if one of them was shown, or if none was there.
     */
    private static Boolean enabledUnderTreeName(Skill newSkill, List<Skill> oldSkills, SkillTreeLookup lookup) {
        List<Skill> renamed = oldSkills.stream()
                .filter(oldSkill -> oldSkill.getName() != null && newSkill.getName().equals(lookup.treeName(oldSkill.getName())))
                .collect(Collectors.toList());
        return renamed.isEmpty() || renamed.stream().anyMatch(oldSkill -> !Boolean.FALSE.equals(oldSkill.getEnabled()));
    }

    private Integer findIndexIn(List<Skill> oldList, Skill newSkill) {
        return IntStream
                .range(0, oldList.size())
                .filter(index -> Objects.equals(oldList.get(index).getId(), newSkill.getId()))
                .boxed()
                .findAny()
                .orElse(null);
    }

    private Integer findIndexIn(List<Project> oldList, Project newProject) {
        return IntStream
                .range(0, oldList.size())
                .filter(index -> Objects.equals(oldList.get(index).getId(), newProject.getId()))
                .boxed()
                .findAny()
                .orElse(null);
    }

    private Integer findIndexIn(List<ProjectRole> oldList, ProjectRole newRole, FormerNames formerNames) {
        return IntStream
                .range(0, oldList.size())
                .filter(index -> formerNames.isNow(PROJECT_ROLE, oldList.get(index).getName(), newRole.getName()))
                .boxed()
                .findFirst()
                .orElse(null);
    }

    /**
     * An entry takes over from the old view profile whether it is shown. It is the old entry with its current name
     * (ignoring case), and if there are several, the one with the same dates; if there still are several (two entries
     * merged into one), it is shown if one of them was.
     */
    private <T extends NameComparable & ToggleableEntry> List<T> mergeEntities(List<T> oldList, List<T> newList,
                                                                                 NameEntityType type, FormerNames formerNames) {
        List<T> toReturn = new ArrayList<>();
        newList.forEach(newEntry -> {
            List<T> sameName = oldList.stream()
                    .filter(entry -> formerNames.isNow(type, entry.getName(), newEntry.getName()))
                    .collect(Collectors.toList());
            List<T> sameDates = sameName.stream()
                    .filter(entry -> haveSameDates(entry, newEntry))
                    .collect(Collectors.toList());
            List<T> matches = sameDates.isEmpty() ? sameName : sameDates;
            if (!matches.isEmpty()) {
                newEntry.setEnabled(matches.stream().anyMatch(ViewProfileMergeService::isShown));
            }
            toReturn.add(newEntry);
        });
        return toReturn;
    }

    private static boolean haveSameDates(Object oldEntry, Object newEntry) {
        if (oldEntry instanceof StartEndDateComparable && newEntry instanceof StartEndDateComparable) {
            StartEndDateComparable oldDates = (StartEndDateComparable) oldEntry;
            StartEndDateComparable newDates = (StartEndDateComparable) newEntry;
            return Objects.equals(oldDates.getStartDate(), newDates.getStartDate())
                    && Objects.equals(oldDates.getEndDate(), newDates.getEndDate());
        }
        if (oldEntry instanceof Qualification && newEntry instanceof Qualification) {
            return Objects.equals(((Qualification) oldEntry).getDate(), ((Qualification) newEntry).getDate());
        }
        return true;
    }

    private static boolean isShown(ToggleableEntry entry) {
        return !Boolean.FALSE.equals(entry.getEnabled());
    }

    /**
     * The display categories of the old view profile stay with their order and what they show (#230). An old skill is
     * the new skill of the same name, or of its name in the skill tree if it was renamed or merged there (#228): the
     * new one takes its place, whether it is shown and which of its versions are. Old skills the profile no longer has
     * go, new ones go into their display category.
     */
    private List<Category> mergeDisplayCategories(List<Category> oldDisplays, List<Category> newDisplays, SkillTreeLookup lookup) {
        List<Skill> newSkills = displaySkillsOf(newDisplays);
        Set<Skill> placed = Collections.newSetFromMap(new IdentityHashMap<>());
        List<Category> result = new ArrayList<>();
        for (Category category : oldDisplays) {
            if (category == null || category.getDisplaySkills() == null) {
                continue;
            }
            List<Skill> skills = new ArrayList<>();
            for (Skill oldSkill : category.getDisplaySkills()) {
                Optional<Skill> maybeNewSkill = newSkills.stream().filter(newSkill -> isNow(oldSkill, newSkill, lookup)).findFirst();
                if (maybeNewSkill.isEmpty()) {
                    continue;
                }
                Skill newSkill = maybeNewSkill.get();
                if (placed.add(newSkill)) {
                    newSkill.setEnabled(isShown(oldSkill));
                    takeVersionsShown(oldSkill, newSkill);
                    skills.add(newSkill);
                } else if (isShown(oldSkill)) {
                    // A second old skill merged into the same one
                    newSkill.setEnabled(true);
                }
            }
            if (!skills.isEmpty()) {
                category.setDisplaySkills(skills);
                skills.forEach(skill -> skill.setDisplayCategory(category));
                result.add(category);
            }
        }
        newSkills.stream()
                .filter(skill -> !placed.contains(skill))
                .forEach(skill -> {
                    Category newCategory = skill.getDisplayCategory();
                    Optional<Category> existing = result.stream()
                            .filter(category -> Objects.equals(category.getId(), newCategory.getId()))
                            .findAny();
                    if (existing.isPresent()) {
                        existing.get().getDisplaySkills().add(skill);
                        skill.setDisplayCategory(existing.get());
                    } else {
                        // Only the skills of the category that aren't placed elsewhere
                        newCategory.setDisplaySkills(newCategory.getDisplaySkills().stream()
                                .filter(other -> !placed.contains(other))
                                .collect(Collectors.toList()));
                        newCategory.setEnabled(true);
                        newCategory.setIsDisplay(true);
                        result.add(newCategory);
                    }
                    placed.add(skill);
                });
        return result;
    }

    private static List<Skill> displaySkillsOf(List<Category> displays) {
        return displays.stream()
                .flatMap(cat -> cat != null && cat.getDisplaySkills() != null ? cat.getDisplaySkills().stream() : Stream.empty())
                .collect(Collectors.toList());
    }

    private static boolean isNow(Skill oldSkill, Skill newSkill, SkillTreeLookup lookup) {
        if (oldSkill.getName() == null || newSkill.getName() == null) {
            return false;
        }
        return oldSkill.getName().equalsIgnoreCase(newSkill.getName())
                || lookup.treeName(oldSkill.getName()).equalsIgnoreCase(newSkill.getName());
    }

    private static void takeVersionsShown(Skill oldSkill, Skill newSkill) {
        if (oldSkill.getVersions() == null || newSkill.getVersions() == null) {
            return;
        }
        newSkill.getVersions().forEach(version -> oldSkill.getVersions().stream()
                .filter(oldVersion -> Objects.equals(oldVersion.getName(), version.getName()))
                .findAny()
                .ifPresent(oldVersion -> version.setEnabled(oldVersion.getEnabled())));
    }
}
