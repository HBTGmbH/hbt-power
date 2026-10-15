package de.hbt.pwr.view.service;


import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileSkillSortTests {

    private ViewProfile viewProfile;
    private ViewProfileSortService viewProfileSortService;

    private Skill skillA;
    private Skill skillB;
    private Skill skillC;
    private Skill skillD;


    @Before
    public void SetUp() {
        viewProfile = new ViewProfile();
        viewProfileSortService = new ViewProfileSortService();
    }


    private void setUpSkillsInDisplayData() {
        Category category = new Category("Category");
        skillA = Skill.builder().name("A").rating(5).displayCategory(category).build();
        skillB = Skill.builder().name("B").rating(2).displayCategory(category).build();
        skillC = Skill.builder().name("C").rating(1).displayCategory(category).build();
        skillD = Skill.builder().name("D").rating(3).displayCategory(category).build();
        category.getDisplaySkills().clear();
        category.getDisplaySkills().addAll(Arrays.asList(skillB, skillA, skillD, skillC));
        //viewProfile.setRootCategory(category);
        //viewProfile.getSkills().addAll(Arrays.asList(skillB, skillA, skillD, skillC));
        //fail("missing");
        viewProfile.getDisplayCategories().add(category);
    }

    @Test
    public void skillsInDisplayCategoryShouldBeSortedByNameAsc() {
        setUpSkillsInDisplayData();
        viewProfileSortService.sortSkillsInDisplayByName(viewProfile, 0, true);
        assertThat(viewProfile.getDisplayCategories().get(0).getDisplaySkills()).containsExactly(skillA, skillB, skillC, skillD);
    }

    @Test
    public void skillsInDisplayCategoryShouldBeSortedByNameDesc() {
        setUpSkillsInDisplayData();
        viewProfileSortService.sortSkillsInDisplayByName(viewProfile, 0, false);
        assertThat(viewProfile.getDisplayCategories().get(0).getDisplaySkills()).containsExactly(skillD, skillC, skillB, skillA);
    }

    @Test
    public void skillsInDisplayCategoryShouldBeSortedByRatingAsc() {
        setUpSkillsInDisplayData();
        viewProfileSortService.sortSkillsInDisplayByRating(viewProfile, 0, true);
        assertThat(viewProfile.getDisplayCategories().get(0).getDisplaySkills()).containsExactly(skillC, skillB, skillD, skillA);
    }

    @Test
    public void skillsInDisplayCategoryShouldBeSortedByRatingDesc() {
        setUpSkillsInDisplayData();
        viewProfileSortService.sortSkillsInDisplayByRating(viewProfile, 0, false);
        assertThat(viewProfile.getDisplayCategories().get(0).getDisplaySkills()).containsExactly(skillA, skillD, skillB, skillC);
    }

    @Test
    public void skillInDisplayCategoryShouldHaveMovedBackward() {
        setUpSkillsInDisplayData();
        // skillB = 0, skillA = 1, skillD = 2, skillC = 3
        // 2 -> 0
        // skillD = 0, skillB = 1, skillA = 2, skillC = 3
        int sourceIndex = 2;
        int targetIndex = 0;
        int categoryIndex = 0;
        viewProfileSortService.moveSkillInDisplayCategory(viewProfile, categoryIndex, sourceIndex, targetIndex);
        assertThat(viewProfile.getDisplayCategories().get(categoryIndex).getDisplaySkills())
                .containsExactly(skillD, skillB, skillA, skillC);
    }

    @Test
    public void skillInDisplayCategoryShouldHaveMovedForward() {
        setUpSkillsInDisplayData();
        // skillB = 0, skillA = 1, skillD = 2, skillC = 3
        // 0 -> 2
        // skillA = 0, skillD = 1, skillB = 2, skillC = 3
        int sourceIndex = 0;
        int targetIndex = 2;
        int categoryIndex = 0;
        viewProfileSortService.moveSkillInDisplayCategory(viewProfile, categoryIndex, sourceIndex, targetIndex);
        assertThat(viewProfile.getDisplayCategories().get(categoryIndex).getDisplaySkills())
                .containsExactly(skillA, skillD, skillB, skillC);
    }
}

