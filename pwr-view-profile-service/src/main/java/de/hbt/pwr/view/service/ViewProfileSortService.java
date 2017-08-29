package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.util.ListUtil;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.Comparator;

@Service
public class ViewProfileSortService {

    private static final Comparator<Skill> SkillByRatingAsc = Comparator.comparing(Skill::getRating);
    private static final Comparator<Skill> SkillByRatingDesc = Comparator.comparing(Skill::getRating).reversed();

    private static final Comparator<Skill> SkillByNameAsc = Comparator.comparing(Skill::getName);
    private static final Comparator<Skill> SkillByNameDesc = Comparator.comparing(Skill::getName).reversed();

    private static final Comparator<Category> CategoryByNameAsc = Comparator.comparing(Category::getName);
    private static final Comparator<Category> CategoryByNameDesc = Comparator.comparing(Category::getName).reversed();

    private static final Comparator<Project> ProjectByStartDateAsc = Comparator.comparing(Project::getStartDate);
    private static final Comparator<Project> ProjectByStartDateDesc = Comparator.comparing(Project::getStartDate).reversed();

    private static final Comparator<Project> ProjectByEndDateAsc = Comparator.comparing(Project::getEndDate);
    private static final Comparator<Project> ProjectByEndDateDesc = Comparator.comparing(Project::getEndDate).reversed();


    private static Comparator<Skill> getSkillNameComparator(boolean sortAscending) {
        return sortAscending ? SkillByNameAsc : SkillByNameDesc;
    }

    private static Comparator<Skill> getSkillRatingComparator(boolean sortAscending) {
        return sortAscending ? SkillByRatingAsc : SkillByRatingDesc;
    }

    public void sortDisplayCategoriesByName(ViewProfile viewProfile, boolean sortAscending) {
        Comparator<Category> comparator = sortAscending ? CategoryByNameAsc : CategoryByNameDesc;
        viewProfile.getDisplayCategories().sort(comparator);
    }

    public void sortSkillsInDisplayByName(ViewProfile viewProfile, int displayCategoryIndex, boolean sortAscending) {
        Comparator<Skill> comparator = getSkillNameComparator(sortAscending);
        viewProfile.getDisplayCategories().get(displayCategoryIndex).getDisplaySkills().sort(comparator);
    }

    public void sortSkillsInDisplayByRating(ViewProfile viewProfile, int displayCategoryIndex, boolean sortAscending) {
        Comparator<Skill> comparator = getSkillRatingComparator(sortAscending);
        viewProfile.getDisplayCategories().get(displayCategoryIndex).getDisplaySkills().sort(comparator);
    }

    public void sortSkillsInProjectByName(ViewProfile viewProfile, int projectIndex, boolean sortAscending) {
        Project project = viewProfile.getProjects().get(projectIndex);
        Comparator<Skill> comparator = getSkillNameComparator(sortAscending);
        project.getSkills().sort(comparator);
    }

    public void sortSkillsInProjectByRating(ViewProfile viewProfile, int projectIndex, boolean sortAscending) {
        Project project = viewProfile.getProjects().get(projectIndex);
        Comparator<Skill> comparator = getSkillRatingComparator(sortAscending);
        project.getSkills().sort(comparator);
    }

    public void sortProjectsByStartDate(ViewProfile viewProfile, boolean sortAscending) {
        Comparator<Project> comparator = sortAscending ? ProjectByStartDateAsc : ProjectByStartDateDesc;
        viewProfile.getProjects().sort(comparator);
    }

    public void sortProjectsByEndDate(ViewProfile viewProfile, boolean sortAscending) {
        Comparator<Project> comparator = sortAscending ? ProjectByEndDateAsc : ProjectByEndDateDesc;
        viewProfile.getProjects().sort(comparator);
    }

    public void moveSkillInDisplayCategory(ViewProfile viewProfile, int categoryIndex, int sourceIndex, int targetIndex) {
        Category displayCategory = viewProfile.getDisplayCategories().get(categoryIndex);
        ListUtil.move(displayCategory.getDisplaySkills(), sourceIndex, targetIndex);
    }

    public void moveDisplayCategory(ViewProfile viewProfile, int sourceIndex, int targetIndex) {
        ListUtil.move(viewProfile.getDisplayCategories(), sourceIndex, targetIndex);
    }

    public void moveProject(ViewProfile viewProfile, int sourceIndex, int targetIndex) {
        ListUtil.move(viewProfile.getProjects(), sourceIndex, targetIndex);
    }


    public void moveSkillInProject(ViewProfile viewProfile, int projectIndex, int sourceIndex, int targetIndex) {
        Project project = viewProfile.getProjects().get(projectIndex);
        ListUtil.move(project.getSkills(), sourceIndex, targetIndex);
    }
}
