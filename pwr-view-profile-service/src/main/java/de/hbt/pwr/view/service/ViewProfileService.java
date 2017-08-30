package de.hbt.pwr.view.service;

import de.hbt.pwr.view.aspects.ViewProfileAutoSave;
import de.hbt.pwr.view.exception.*;
import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.springframework.data.util.StreamUtils;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

@Service
@ViewProfileAutoSave
public class ViewProfileService {

    private final ViewProfileRepository viewProfileRepository;

    ViewProfileService(ViewProfileRepository viewProfileRepository) {
        this.viewProfileRepository = viewProfileRepository;
    }

    @NotNull
    public List<String> getViewProfileIdsForInitials(@NotNull String initials) {
        return StreamUtils.createStreamFromIterator(viewProfileRepository.findAll().iterator())
                .filter(viewProfile -> viewProfile.getOwnerInitials().equals(initials))
                .map(ViewProfile::getId)
                .collect(Collectors.toList());
    }

    @NotNull
    public ViewProfile getByIdAndCheckOwner(@NotNull String id, @NotNull String owner) {
        ViewProfile viewProfile = viewProfileRepository.findOne(id);
        if(viewProfile == null) {
            throw new ViewProfileNotFoundException(id);
        }
        if(!viewProfile.getOwnerInitials().equals(owner)) {
            throw new InvalidOwnerException(id, owner);
        }
        return viewProfile;
    }

    public void deleteWithOwnerCheck(@NotNull String id, @NotNull String owner) {
        ViewProfile viewProfile = viewProfileRepository.findOne(id);
        if(viewProfile == null) {
            throw new ViewProfileNotFoundException(id);
        }
        if(!viewProfile.getOwnerInitials().equals(owner)) {
            throw new InvalidOwnerException(id, owner);
        }
        viewProfileRepository.delete(id);
    }

    private <T extends ToggleableEntry> void setEnabled(List<T> list, int index, boolean isEnabled) {
        list.get(index).setEnabled(isEnabled);
    }

    private <T extends ToggleableEntry> void setEnabledForAll(List<T> list, boolean isEnabled) {
        list.forEach(t -> t.setEnabled(isEnabled));
    }


    public void setIsEnabled(ViewProfile viewProfile, int index, boolean isEnabled, ProfileEntryType profileEntryType) {
        List<? extends ToggleableEntry> toggleableEntries = profileEntryType.getToggleable(viewProfile);
        setEnabled(toggleableEntries, index, isEnabled);
    }

    public void setIsEnabledForAll(ViewProfile viewProfile, ProfileEntryType profileEntryType, Boolean isEnabled) {
        List<? extends ToggleableEntry> toggleableEntries = profileEntryType.getToggleable(viewProfile);
        setEnabledForAll(toggleableEntries, isEnabled);
    }

    public void setRoleInProjectEnabled(ViewProfile viewProfile, int projectIndex, int roleIndex, boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getProjectRoles().get(roleIndex).setEnabled(isEnabled);
    }

    public void setSkillInProjectEnabled(ViewProfile viewProfile, int projectIndex, int skillIndex, boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getSkills().get(skillIndex).setEnabled(isEnabled);
    }

    public void setIsEnabledForAllSkillsInProject(ViewProfile viewProfile, int projectIndex, boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getSkills().forEach(skill -> skill.setEnabled(isEnabled));
    }

    public void setIsEnabledForAllRolesInProject(ViewProfile viewProfile, int projectIndex, boolean isEnabled) {
        viewProfile.getProjects().get(projectIndex).getProjectRoles().forEach(projectRole -> projectRole.setEnabled(isEnabled));
    }

    /**
     * Recursivley sets the display category or throws {@link DisplayCategoryNotFoundException} if the category
     * can not be found.
     * <br/>
     * <br/>
     * See {@linkplain ViewProfileService#setDisplayCategory(ViewProfile, int, String)} for doc.
     */
    private void setDisplayCategory(ViewProfile viewProfile, Skill skill, String newDisplayCategoryName, Category currentCategory) {
        if(currentCategory != null) {
            if(currentCategory.getName().equals(newDisplayCategoryName)) {
                skill.setDisplayCategory(currentCategory);
            } else {
                setDisplayCategory(viewProfile, skill, newDisplayCategoryName, currentCategory.getParent());
            }
        } else {
            throw new DisplayCategoryNotFoundException(viewProfile.getId(), skill.getName(), newDisplayCategoryName);
        }
    }

    /**
     * Sets the display category of the skill at the position <code>skillIndex</code>
     * <p>
     *     The new display category is identified by its {@link Category#name}, which is unique per view profile.
     *     The category identified by this name <bold>must</bold> be a direct or indirect parent of the skill at
     *     <code>skillIndex</code>. If this is not the case, {@link DisplayCategoryNotFoundException} is thrown.
     * </p>
     * <p>
     *     Also sets the {@link ViewProfile#displayCategories}
     * </p>
     * @param viewProfile to be changed
     * @param skillIndex index of the skill in the collection of {@link ViewProfile#skills}
     * @param newDisplayCategoryName of the category that is supposed to be the new display category.
     */
    public void setDisplayCategory(ViewProfile viewProfile, int skillIndex, String newDisplayCategoryName) {
        Skill skill = viewProfile.getSkills().get(skillIndex);
        viewProfile.getDisplayCategories().remove(skill.getDisplayCategory());
        setDisplayCategory(viewProfile, skill, newDisplayCategoryName, skill.getCategory());
        viewProfile.getDisplayCategories().add(skill.getDisplayCategory());
    }

    public void setDescription(ViewProfile viewProfile, String newDescription) {
        viewProfile.setDescription(newDescription);
    }

    private void addNewCategory(Category current, String parentName, String newName) {
        if(parentName.equals(current.getName())) {
            Category category = Category.builder().name(newName).parent(current).isDisplay(false).enabled(true).build();
            current.getChildren().add(category);
        } else {
            current.getChildren().forEach(category -> addNewCategory(category, parentName, newName));
        }
    }

    private boolean categoryContains(@NotNull Category current, @NotNull String nameToFind) {
        return nameToFind.equals(current.getName())
                || current.getChildren().stream().anyMatch(category -> categoryContains(category, nameToFind));
    }

    public void addNewCategory(@NotNull ViewProfile viewProfile,
                               @NotNull String parentName,
                               @NotNull String newCategoryName) {
        if(categoryContains(viewProfile.getRootCategory(), newCategoryName)) {
            throw new CategoryNotUniqueException(newCategoryName);
        }
        if(!categoryContains(viewProfile.getRootCategory(), parentName)) {
            throw new CategoryNotFoundException(parentName);
        }
        addNewCategory(viewProfile.getRootCategory(), parentName, newCategoryName);
    }
}
