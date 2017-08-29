package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ViewProfile;
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


    public void sortDisplayCategoriesByName(ViewProfile viewProfile, boolean sortAscending) {
        Comparator<Category> comparator = sortAscending ? CategoryByNameAsc : CategoryByNameDesc;
        viewProfile.getDisplayCategories().sort(comparator);
    }

    public void sortSkillsInDisplayByName(ViewProfile viewProfile, int displayCategoryIndex, boolean sortAscending) {
        Comparator<Skill> comparator = sortAscending ? SkillByNameAsc : SkillByNameDesc;
        viewProfile.getDisplayCategories().get(displayCategoryIndex).getDisplaySkills().sort(comparator);
    }

    public void sortSkillsInDisplayByRating(ViewProfile viewProfile, int displayCategoryIndex, boolean sortAscending) {
        Comparator<Skill> comparator = sortAscending ? SkillByRatingAsc : SkillByRatingDesc;
        viewProfile.getDisplayCategories().get(displayCategoryIndex).getDisplaySkills().sort(comparator);
    }

    public void moveSkillInDisplayCategory(ViewProfile viewProfile, int categoryIndex, int sourceIndex, int targetIndex) {
        Category displayCategory = viewProfile.getDisplayCategories().get(categoryIndex);
        ListUtil.move(displayCategory.getDisplaySkills(), sourceIndex, targetIndex);
    }

    public void moveDisplayCategory(ViewProfile viewProfile, int sourceIndex, int targetIndex) {
        ListUtil.move(viewProfile.getDisplayCategories(), sourceIndex, targetIndex);
    }
}
