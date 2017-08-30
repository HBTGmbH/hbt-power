package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.util.ListUtil;
import org.springframework.stereotype.Service;

import java.util.Comparator;

/**
 * Contains sort operations for a {@link ViewProfile}.
 * @author nt / nt@hbt.de
 */
@Service
public class ViewProfileSortService {

    private static final Comparator<Skill> SkillByRatingAsc = Comparator.comparing(Skill::getRating);
    private static final Comparator<Skill> SkillByRatingDesc = Comparator.comparing(Skill::getRating).reversed();

    private static final Comparator<Project> ProjectByStartDateAsc = Comparator.comparing(Project::getStartDate);
    private static final Comparator<Project> ProjectByStartDateDesc = Comparator.comparing(Project::getStartDate).reversed();

    private static final Comparator<Project> ProjectByEndDateAsc = Comparator.comparing(Project::getEndDate);
    private static final Comparator<Project> ProjectByEndDateDesc = Comparator.comparing(Project::getEndDate).reversed();


    private static final Comparator<NameComparable> ByNameAsc = Comparator.comparing(NameComparable::getName);
    private static final Comparator<NameComparable> ByNameDesc = Comparator.comparing(NameComparable::getName).reversed();

    /**
     * Returns a comparator that compares {@link Skill} by {@link Skill#name}
     * @param sortAscending asc or desc sorting
     * @return the comparator
     */
    private static Comparator<NameComparable> getNameComparator(boolean sortAscending) {
        return sortAscending ? ByNameAsc : ByNameDesc;
    }

    /**
     * Returns a comparator that compares {@link Skill} by {@link Skill#rating}
     * @param sortAscending asc or desc sorting
     * @return the comparator
     */
    private static Comparator<Skill> getSkillRatingComparator(boolean sortAscending) {
        return sortAscending ? SkillByRatingAsc : SkillByRatingDesc;
    }

    public void sortEntryByName(ViewProfile viewProfile, NameComparableEntryType entryType, boolean sortAscending) {
        Comparator<NameComparable> comparator = getNameComparator(sortAscending);
        entryType.getComparable(viewProfile).sort(comparator);
    }

    public void sortSkillsInDisplayByName(ViewProfile viewProfile, int displayCategoryIndex, boolean sortAscending) {
        Comparator<NameComparable> comparator = getNameComparator(sortAscending);
        viewProfile.getDisplayCategories().get(displayCategoryIndex).getDisplaySkills().sort(comparator);
    }

    public void sortSkillsInDisplayByRating(ViewProfile viewProfile, int displayCategoryIndex, boolean sortAscending) {
        Comparator<Skill> comparator = getSkillRatingComparator(sortAscending);
        viewProfile.getDisplayCategories().get(displayCategoryIndex).getDisplaySkills().sort(comparator);
    }

    public void sortSkillsInProjectByName(ViewProfile viewProfile, int projectIndex, boolean sortAscending) {
        Project project = viewProfile.getProjects().get(projectIndex);
        Comparator<NameComparable> comparator = getNameComparator(sortAscending);
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

    public void move(ViewProfile viewProfile, ProfileEntryType profileEntryType, int sourceIndex, int targetIndex) {
        ListUtil.move(profileEntryType.extractMovableEntry(viewProfile), sourceIndex, targetIndex);
    }


    public void moveSkillInProject(ViewProfile viewProfile, int projectIndex, int sourceIndex, int targetIndex) {
        Project project = viewProfile.getProjects().get(projectIndex);
        ListUtil.move(project.getSkills(), sourceIndex, targetIndex);
    }


}
