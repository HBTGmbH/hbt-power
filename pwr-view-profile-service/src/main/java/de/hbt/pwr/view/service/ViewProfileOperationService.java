package de.hbt.pwr.view.service;

import de.hbt.pwr.view.aspects.ViewProfileAutoSave;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.exception.DisplayCategoryNotFoundException;
import de.hbt.pwr.view.exception.InvalidOwnerException;
import de.hbt.pwr.view.exception.ServiceSkillNotFoundException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.DisplayCategoryTarget;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.util.StreamUtils;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@ViewProfileAutoSave
public class ViewProfileOperationService {

    private static final Logger LOG = LogManager.getLogger(ViewProfileOperationService.class);

    private final ViewProfileRepository viewProfileRepository;

    private final SkillServiceClient skillServiceClient;

    ViewProfileOperationService(ViewProfileRepository viewProfileRepository,
                                SkillServiceClient skillServiceClient) {
        this.viewProfileRepository = viewProfileRepository;
        this.skillServiceClient = skillServiceClient;
    }

    private ViewProfile findViewProfile(String id) {
        return viewProfileRepository.findById(id)
                .orElseThrow(() -> new ViewProfileNotFoundException(id));
    }

    /**
     * Collects all {@link ViewProfile#getId()} from the owners initials and returns them in a list
     *
     * @param initials of the owner
     * @return the list containing all ids from the owners ViewProfiles
     */
    @NotNull
    public List<String> getViewProfileIdsForInitials(@NotNull String initials) {
        try (Stream<ViewProfile> streamFromIterator = StreamUtils
                .createStreamFromIterator(viewProfileRepository.findAll().iterator())) {
            return streamFromIterator
                    .filter(viewProfile -> viewProfile.getViewProfileInfo().getOwnerInitials()
                            .equals(initials)).map(ViewProfile::getId).collect(Collectors.toList());
        }
    }

    /**
     * Attempts to retrieve a {@link ViewProfile} by its {@link ViewProfile#getId()}. If successfully retrieved,
     * the {@link ViewProfileInfo#getOwnerInitials()} is checked against <code>owner</code>.
     *
     * @param id    of the view profile
     * @param owner is the expected owner of the view profile
     * @return the retrieved {@link ViewProfile}
     * @throws ViewProfileNotFoundException if <code>id</code> does not represent a {@link ViewProfile}
     * @throws InvalidOwnerException        if <code>owner</code> does not match {@link ViewProfileInfo#getOwnerInitials()}
     */
    @NotNull
    public ViewProfile getByIdAndCheckOwner(@NotNull String id, @NotNull String owner) {
        ViewProfile viewProfile = findViewProfile(id);
        if (!viewProfile.getViewProfileInfo().getOwnerInitials().equals(owner)) {
            throw new InvalidOwnerException(id, owner);
        }
        return viewProfile;
    }

    /**
     * Attempts to delete a {@link ViewProfile}.
     *
     * @param id    of the view profile
     * @param owner is the expected owner of the {@link ViewProfile}
     * @throws ViewProfileNotFoundException if <code>id</code> does not represent a {@link ViewProfile}
     * @throws InvalidOwnerException        if <code>owner</code> does not match {@link ViewProfileInfo#getOwnerInitials()}
     */
    public void deleteWithOwnerCheck(@NotNull String id, @NotNull String owner) {
        ViewProfile viewProfile = findViewProfile(id);
        if (!viewProfile.getViewProfileInfo().getOwnerInitials().equals(owner)) {
            throw new InvalidOwnerException(id, owner);
        }
        viewProfileRepository.deleteById(id);
    }

    private <T extends ToggleableEntry> void setEnabled(List<T> list, int index,
                                                        boolean isEnabled) {
        list.get(index).setEnabled(isEnabled);
    }

    private <T extends ToggleableEntry> void setEnabledForAll(List<T> list, boolean isEnabled) {
        list.forEach(t -> t.setEnabled(isEnabled));
    }

    public void setIsEnabled(ViewProfile viewProfile, int index, boolean isEnabled,
                             ProfileEntryType profileEntryType) {
        List<? extends ToggleableEntry> toggleableEntries =
                profileEntryType.getToggleable(viewProfile);
        setEnabled(toggleableEntries, index, isEnabled);
    }

    public void setIsEnabledForAll(ViewProfile viewProfile, ProfileEntryType profileEntryType,
                                   Boolean isEnabled) {
        List<? extends ToggleableEntry> toggleableEntries =
                profileEntryType.getToggleable(viewProfile);
        setEnabledForAll(toggleableEntries, isEnabled);
    }

    public void setRoleInProjectEnabled(ViewProfile viewProfile, int projectIndex, int roleIndex,
                                        boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getProjectRoles().get(roleIndex)
                .setEnabled(isEnabled);
    }

    public void setSkillInProjectEnabled(ViewProfile viewProfile, int projectIndex, int skillIndex,
                                         boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getSkills().get(skillIndex)
                .setEnabled(isEnabled);
    }

    public void setIsEnabledForAllSkillsInProject(ViewProfile viewProfile, int projectIndex,
                                                  boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getSkills()
                .forEach(skill -> skill.setEnabled(isEnabled));
    }

    public void setIsEnabledForAllRolesInProject(ViewProfile viewProfile, int projectIndex,
                                                 boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getProjectRoles()
                .forEach(projectRole -> projectRole.setEnabled(isEnabled));
    }

    private void setIsEnabledForSkill(Skill skill, String name, boolean isEnabled) {
        if (name.equals(skill.getName())) {
            skill.setEnabled(isEnabled);
        }
    }

    private void setIsEnabledForSkill(Category category, String skillName, boolean isEnabled) {
        category.getDisplaySkills().stream().filter(skill -> skill.getName().equals(skillName))
                .findAny().ifPresent(skill -> skill.setEnabled(isEnabled));
    }

    public void setIsEnabledForSkill(ViewProfile viewProfile, String skillName, boolean isEnabled) {
        viewProfile.getDisplayCategories().forEach(category -> setIsEnabledForSkill(category, skillName, isEnabled));
    }


    private void setIsEnabledForAllSkills(Category category, boolean isEnabled) {
        category.getDisplaySkills().forEach(skill -> skill.setEnabled(isEnabled));
    }


    public void setIsEnabledForVersionOfSkill(ViewProfile viewProfile, String skillName, String versionName, boolean isEnabled) {
        Skill skill = viewProfile.findSkillByName(skillName).orElseThrow(RuntimeException::new);
        skill.setEnabledForVersion(versionName, isEnabled);
    }

    /**
     * Shows or hides the versions of all skills in the export (#151); the choice per version stays as it is.
     */
    public void setShowSkillVersions(ViewProfile viewProfile, boolean show) {
        viewProfile.setShowSkillVersions(show);
    }

    /**
     * Sets {@link Skill#getEnabled()} to <code>isEnabled</code> for all skills.
     *
     * @param viewProfile that is affected
     * @param isEnabled   new statue of {@link Skill#getEnabled()}
     */
    public void setIsEnabledForAllSkills(ViewProfile viewProfile, boolean isEnabled) {
        viewProfile.getDisplayCategories()
                .forEach(category -> setIsEnabledForAllSkills(category, isEnabled));
    }

    public void setDescription(ViewProfile viewProfile, String newDescription) {
        viewProfile.setDescription(newDescription);
    }

    public void updateInfo(ViewProfile viewProfile, ViewProfileInfo viewProfileInfo) {
        if (viewProfileInfo.getConsultantBirthDate() != null) {
            viewProfile.getViewProfileInfo()
                    .setConsultantBirthDate(viewProfileInfo.getConsultantBirthDate());
        }
        if (viewProfileInfo.getConsultantName() != null) {
            viewProfile.getViewProfileInfo().setConsultantName(viewProfileInfo.getConsultantName());
        }
        if (viewProfileInfo.getName() != null) {
            viewProfile.getViewProfileInfo().setName(viewProfileInfo.getName());
        }
        if (viewProfileInfo.getViewDescription() != null) {
            viewProfile.getViewProfileInfo()
                    .setViewDescription(viewProfileInfo.getViewDescription());
        }
        if (viewProfileInfo.getCharsPerLine() != null) {
            viewProfile.getViewProfileInfo().setCharsPerLine(viewProfileInfo.getCharsPerLine());
        }
    }

    private Category toCategory(SkillServiceCategory serviceCategory) {
        return toCategory(serviceCategory, null);
    }

    /**
     * A display category for the category of the skill tree, with its name in the language of the view profile (#174)
     */
    private Category toCategory(SkillServiceCategory serviceCategory, String language) {
        if (serviceCategory != null) {
            Category category = new Category(serviceCategory.getQualifier());
            category.setId(serviceCategory.getId().longValue());
            category.setLocalizedName(ViewProfileLocalizationService.localizedName(serviceCategory.getQualifiers(), language));
            return category;
        }
        return null;
    }

    public Category getDisplayCategoryForSkillName(String skillName) {
        SkillServiceSkill serviceSkill = skillServiceClient.getSkillByName(skillName);
        SkillServiceCategory category = null;
        if (serviceSkill != null) {
            category = serviceSkill.getCategory();
            while (!category.getDisplay() && category.getCategory() != null
                    && category.getCategory().getCategory() != null) {
                category = category.getCategory();
            }

        }
        return toCategory(category);
    }

    /**
     * Sets the display category of the skill with the given name.
     * <p>
     * The new display category is identified by its {@link Category#getName()}, which is unique per view profile.
     * The category identified by this name <bold>must</bold> be a direct or indirect parent of the skill at
     * <code>skillIndex</code>. If this is not the case, {@link DisplayCategoryNotFoundException} is thrown.
     * </p>
     * <p>
     * Also sets the {@link ViewProfile#getDisplayCategories()}
     * </p>
     *
     * @param viewProfile            to be changed
     * @param name                   name of the skill
     * @param newDisplayCategoryName of the category that is supposed to be the new display category.
     */
    public ViewProfile setDisplayCategory(ViewProfile viewProfile, String name,
                                          String newDisplayCategoryName) {
        Optional<Skill> mayBeSkill = viewProfile.findSkillByName(name);
        if (mayBeSkill.isPresent()) {
            Category newDisplayCategory = getNewDisplayCategory(name, newDisplayCategoryName, viewProfile.getLocalization());
            placeInDisplayCategory(viewProfile, mayBeSkill.get(), newDisplayCategory);
        }
        LOG.debug(viewProfile.getDisplayCategories().toString());
        return viewProfile;
    }

    /**
     * Takes the skill out of its display category (gone when empty) and puts it into the new one: the category of
     * the view profile if it has it, the new one otherwise
     */
    private void placeInDisplayCategory(ViewProfile viewProfile, Skill skill, Category newDisplayCategory) {
        Category displayCategory = skill.getDisplayCategory();
        displayCategory.getDisplaySkills().remove(skill);
        if (displayCategory.getDisplaySkills().isEmpty()) {
            displayCategory.setIsDisplay(false);
            viewProfile.getDisplayCategories().remove(displayCategory);
        }
        if (newDisplayCategory != null) {
            Category target = viewProfile.getDisplayCategories().stream()
                    .filter(category -> category.getId().equals(newDisplayCategory.getId()))
                    .findAny()
                    .orElseGet(() -> {
                        newDisplayCategory.setIsDisplay(true);
                        newDisplayCategory.setEnabled(true);
                        viewProfile.getDisplayCategories().add(newDisplayCategory);
                        return newDisplayCategory;
                    });
            // Adds the skill to it, once (#160: it was added a second time before)
            skill.setDisplayCategory(target);
        }
    }

    /**
     * The categories of the skill tree the skills of a display category can move to (#171): every category on the
     * way from a skill up the tree, with the number of skills that hang at or below it. In the order of the tree,
     * parents before children, siblings by name. The view profile comes second: reading it must not save it
     * ({@link de.hbt.pwr.view.aspects.ViewProfileAutoSave}).
     */
    public List<DisplayCategoryTarget> getMoveTargets(int displayCategoryIndex, ViewProfile viewProfile) {
        Category displayCategory = viewProfile.getDisplayCategories().get(displayCategoryIndex);
        List<List<SkillServiceCategory>> chains = displayCategory.getDisplaySkills().stream()
                .map(skill -> chainOf(skill.getName()))
                .collect(Collectors.toList());
        Map<Integer, SkillServiceCategory> categories = new HashMap<>();
        Map<Integer, Integer> parents = new HashMap<>();
        Map<Integer, Integer> counts = new HashMap<>();
        chains.forEach(chain -> {
            for (int i = 0; i < chain.size(); i++) {
                SkillServiceCategory category = chain.get(i);
                categories.putIfAbsent(category.getId(), category);
                parents.put(category.getId(), i + 1 < chain.size() ? chain.get(i + 1).getId() : null);
                counts.merge(category.getId(), 1, Integer::sum);
            }
        });
        List<DisplayCategoryTarget> targets = new ArrayList<>();
        int of = displayCategory.getDisplaySkills().size();
        addInTreeOrder(null, 0, categories, parents, counts, of, displayCategory.getId(), targets);
        return targets;
    }

    private void addInTreeOrder(Integer parentId, int depth, Map<Integer, SkillServiceCategory> categories,
                                Map<Integer, Integer> parents, Map<Integer, Integer> counts, int of, Long currentId,
                                List<DisplayCategoryTarget> targets) {
        categories.values().stream()
                .filter(category -> Objects.equals(parents.get(category.getId()), parentId))
                .map(this::toCategory)
                .sorted(Comparator.comparing(Category::getName))
                .forEach(category -> {
                    Integer id = category.getId().intValue();
                    targets.add(new DisplayCategoryTarget(category.getId(), category.getName(), depth, counts.get(id), of,
                            category.getId().equals(currentId)));
                    addInTreeOrder(id, depth + 1, categories, parents, counts, of, currentId, targets);
                });
    }

    /**
     * Moves the skills of a display category that hang at or below the target category in the skill tree into it
     * (#171); the others stay
     */
    public void moveAllSkills(ViewProfile viewProfile, int displayCategoryIndex, int targetCategoryId) {
        Category displayCategory = viewProfile.getDisplayCategories().get(displayCategoryIndex);
        // A copy: moving takes the skills out of the category
        new ArrayList<>(displayCategory.getDisplaySkills()).forEach(skill -> chainOf(skill.getName()).stream()
                .filter(category -> category.getId() == targetCategoryId)
                .findFirst()
                .ifPresent(target -> placeInDisplayCategory(viewProfile, skill, toCategory(target, viewProfile.getLocalization()))));
    }

    /** The categories of a skill in the skill tree, from its own up to the highest */
    private List<SkillServiceCategory> chainOf(String skillName) {
        List<SkillServiceCategory> chain = new ArrayList<>();
        SkillServiceSkill serviceSkill = skillServiceClient.getSkillByName(skillName);
        for (SkillServiceCategory category = serviceSkill != null ? serviceSkill.getCategory() : null; category != null;
             category = category.getCategory()) {
            if (category.getId() != null) {
                chain.add(category);
            }
        }
        return chain;
    }

    private Category getNewDisplayCategory(String skillName, String newDisplayCategoryName, String language) {
        SkillServiceSkill serviceSkill = skillServiceClient.getSkillByName(skillName);
        SkillServiceCategory category = null;
        if (serviceSkill != null && serviceSkill.getCategory() != null) {
            category = serviceSkill.getCategory();
            while (!category.getQualifier().equals(newDisplayCategoryName)) {
                category = category.getCategory();
            }
        }
        if (category == null) {
            throw new DisplayCategoryNotFoundException("", skillName, newDisplayCategoryName);
        }
        return toCategory(category, language);
    }

    public Map<Integer, Category> getParentsForSkill(String skillName) {
        SkillServiceSkill serviceSkill = skillServiceClient.getSkillByName(skillName);
        if (serviceSkill != null) {
            Map<Integer, Category> result = new HashMap<>();
            SkillServiceCategory c = serviceSkill.getCategory();
            int i = 0;
            while (c != null) {
                result.put(i++, toCategory(c));
                c = c.getCategory();
            }
            return result;
        } else {
            throw new ServiceSkillNotFoundException(skillName);
        }
    }

    public void migrateViewProfiles() {
        Iterable<ViewProfile> allOldViewProfiles =
                viewProfileRepository.findAll();
        allOldViewProfiles.forEach(viewProfile -> {
            String id = viewProfile.getId();
            viewProfileRepository.deleteById(id);
            viewProfileRepository.save(viewProfile);
        });
    }
}
