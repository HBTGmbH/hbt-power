package de.hbt.pwr.view.service;

import de.hbt.pwr.view.aspects.ViewProfileAutoSave;
import de.hbt.pwr.view.aspects.ViewProfileRestore;
import de.hbt.pwr.view.exception.*;
import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import de.hbt.pwr.view.util.ModelConvertUtil;
import org.springframework.data.util.StreamUtils;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@ViewProfileAutoSave
@ViewProfileRestore
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


    public void setIsEnabledForSkill(ViewProfile viewProfile, String skillName, boolean isEnabled) {
        Optional<Skill> skill = viewProfile.findSkillByName(skillName);
        skill.ifPresent(skill1 -> skill1.setEnabled(isEnabled));
    }

    /**
     * {@link ViewProfileService#setIsEnabledForAllSkills(ViewProfile, boolean)} but recursively
     * @param category of skills currently changed
     * @param isEnabled new statue of {@link Skill#enabled}
     */
    private void setIsEnabledForAllSkills(Category category, boolean isEnabled) {
        category.getSkills().forEach(skill -> skill.setEnabled(isEnabled));
        category.getChildren().forEach(child -> setIsEnabledForAllSkills(child, isEnabled));
    }

    /**
     * Sets {@link Skill#enabled} to <code>isEnabled</code> for all skills.
     * @param viewProfile that is affected
     * @param isEnabled new statue of {@link Skill#enabled}
     */
    public void setIsEnabledForAllSkills(ViewProfile viewProfile, boolean isEnabled) {
        setIsEnabledForAllSkills(viewProfile.getRootCategory(), isEnabled);
    }

    /**
     * Recursively sets the display category or throws {@link DisplayCategoryNotFoundException} if the category
     * can not be found.
     * <br/>
     * <br/>
     * See {@linkplain ViewProfileService#setDisplayCategory(ViewProfile, String, String)}  for doc.
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
     * Sets the display category of the skill with the given name.
     * <p>
     *     The new display category is identified by its {@link Category#name}, which is unique per view profile.
     *     The category identified by this name <bold>must</bold> be a direct or indirect parent of the skill at
     *     <code>skillIndex</code>. If this is not the case, {@link DisplayCategoryNotFoundException} is thrown.
     * </p>
     * <p>
     *     Also sets the {@link ViewProfile#displayCategories}
     * </p>
     * @param viewProfile to be changed
     * @param name name of the skill
     * @param newDisplayCategoryName of the category that is supposed to be the new display category.
     */
    public void setDisplayCategory(ViewProfile viewProfile, String name, String newDisplayCategoryName) {
        Optional<Skill> mayBeSkill = viewProfile.findSkillByName(name);
        if(mayBeSkill.isPresent()) {
            Skill skill = mayBeSkill.get();
            viewProfile.getDisplayCategories().remove(skill.getDisplayCategory());
            setDisplayCategory(viewProfile, skill, newDisplayCategoryName, skill.getCategory());
            viewProfile.getDisplayCategories().add(skill.getDisplayCategory());
        }
    }

    public void setDescription(ViewProfile viewProfile, String newDescription) {
        viewProfile.setDescription(newDescription);
    }

    private void addNewCategory(Category current, String parentName, String newName) {
        if(parentName.equals(current.getName())) {
            Category category = new Category(newName, false, current, true);
            current.getChildren().add(category);
        } else {
            current.getChildren().forEach(category -> addNewCategory(category, parentName, newName));
        }
    }

    private boolean categoryContains(@NotNull Category current, @NotNull String nameToFind) {
        return nameToFind.equals(current.getName())
                || current.getChildren().stream().anyMatch(category -> categoryContains(category, nameToFind));
    }

    /**
     * Adds a new category to the view profile.
     * <p>
     *     The new category is added as child to the category identified by <code>parentName</code> and its
     *     {@link Category#name} will be set to <code>newCategoryName</code>.
     * </p>

     * @param viewProfile to be edited
     * @param parentName of the category where the new category is added
     * @param newCategoryName of the new category
     *
     * @throws CategoryNotUniqueException if a {@link Category} with the given <code>newCategoryName</code> already exists
     * @throws CategoryNotFoundException if no {@link Category} with the given <code>parentName</code> exists
     */
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

    private void addSkill(Skill skill, Category category, String parentCategoryName) {
        if(category.getName().equals(parentCategoryName)) {
            skill.setCategory(category);
        } else {
            category.getChildren().forEach(child -> addSkill(skill, child, parentCategoryName));
        }
    }

    public void moveSkill(ViewProfile viewProfile, String skillName, String parentCategoryName) {
        if(!categoryContains(viewProfile.getRootCategory(), parentCategoryName)) {
            throw new CategoryNotFoundException(parentCategoryName);
        }
        Optional<Skill> skillOptional = viewProfile.findSkillByName(skillName);
        if(skillOptional.isPresent()) {
            Skill skill = skillOptional.get();
            // Important: Remove the skill from its parent list.
            skill.getCategory().getSkills().remove(skill);
            addSkill(skill, viewProfile.getRootCategory(), parentCategoryName);
            // This applies default display category rules to the skill ("best guess")
            ModelConvertUtil.setDisplayCategory(skill);
        }
    }
}
