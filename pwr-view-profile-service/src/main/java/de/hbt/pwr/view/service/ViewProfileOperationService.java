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
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.util.StreamUtils;
import org.springframework.stereotype.Service;
import org.w3c.dom.stylesheets.LinkStyle;

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

    public ViewProfileOperationService(ViewProfileRepository viewProfileRepository,
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
        viewProfile.getDisplayCategories().forEach(category -> {
            setIsEnabledForSkill(category, skillName, isEnabled);
        });
    }


    private void setIsEnabledForAllSkills(Category category, boolean isEnabled) {
        category.getDisplaySkills().forEach(skill -> skill.setEnabled(isEnabled));
    }


    public void setIsEnabledForVersionOfSkill(ViewProfile viewProfile, String skillName, String versionName, boolean isEnabled) {
        Skill skill = viewProfile.findSkillByName(skillName).orElseThrow(RuntimeException::new);
        skill.setEnabledForVersion(versionName, isEnabled);
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
        if (serviceCategory != null) {
            Category category = new Category(serviceCategory.getLocalizedQualifier("deu"));
            category.setId(serviceCategory.getId().longValue());
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
            Skill skill = mayBeSkill.get();

            Category displayCategory = skill.getDisplayCategory();
            displayCategory.getDisplaySkills().remove(skill);
            if (displayCategory.getDisplaySkills().isEmpty()) {
                displayCategory.setIsDisplay(false);
                viewProfile.getDisplayCategories().remove(displayCategory);
            }

            Category newDisplayCategory = getNewDisplayCategory(name, newDisplayCategoryName);
            if (newDisplayCategory != null) {
                skill.setDisplayCategory(newDisplayCategory);
                if (viewProfile.getDisplayCategories().stream().noneMatch(
                        category -> category.getId().equals(newDisplayCategory.getId()))) {
                    newDisplayCategory.getDisplaySkills().add(skill);
                    newDisplayCategory.setIsDisplay(true);
                    newDisplayCategory.setEnabled(true);
                    viewProfile.getDisplayCategories().add(newDisplayCategory);
                } else {
                    viewProfile.getDisplayCategories().stream()
                            .filter(category -> category.getId().equals(newDisplayCategory.getId()))
                            .findAny()
                            .ifPresent(category -> category.getDisplaySkills().add(skill));
                }
            }
        }
        LOG.debug(viewProfile.getDisplayCategories().toString());
        return viewProfile;
    }

    private Category getNewDisplayCategory(String skillName, String newDisplayCategoryName) {
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
        return toCategory(category);
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
