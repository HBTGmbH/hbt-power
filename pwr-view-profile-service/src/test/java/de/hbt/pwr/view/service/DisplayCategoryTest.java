package de.hbt.pwr.view.service;

import de.hbt.pwr.view.exception.DisplayCategoryNotFoundException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
public class DisplayCategoryTest {
    private ViewProfileService viewProfileService;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    private ViewProfile viewProfile;

    @Before
    public void setUp() {
        viewProfile = new ViewProfile();
        viewProfileService = new ViewProfileService(viewProfileRepository);
    }

    /**
     * A display category can be changed and is changed to the correct category
     */
    @Test
    public void displayCategoryShouldChange() {
        Category category1 = Category.builder().name("Category1").build();
        Category category2 = Category.builder().name("Category2").parent(category1).build();
        Skill skill = Skill.builder().name("Skill1").category(category2).displayCategory(category1).build();
        viewProfile.getSkills().add(skill);
        viewProfileService.setDisplayCategory(viewProfile, 0, category1.getName());
        assertThat(viewProfile.getSkills().get(0).getDisplayCategory()).isEqualTo(category1);
    }

    /**
     * Checks that the display category can also be changed when the new display category
     * is lower in the hierarchy than the current display category.
     */
    @Test
    public void displayCategoryShouldChangeWithLowerOrderCategory() {
        Category categoryHighHigh= Category.builder().name("CategoryHighHigh").build();
        Category categoryHigh = Category.builder().name("CategoryHigh").parent(categoryHighHigh).build();
        Category categoryMid = Category.builder().name("CategoryMid").parent(categoryHigh).build();
        Category categoryLow = Category.builder().name("CategoryLow").parent(categoryMid).build();
        Skill skill1 = Skill.builder().name("Skill").category(categoryLow).displayCategory(categoryHighHigh).build();
        Skill skill2 = Skill.builder().name("Skill2").category(categoryHighHigh).displayCategory(categoryHighHigh).build();
        viewProfile.getSkills().add(skill2);
        viewProfile.getSkills().add(skill1);
        viewProfileService.setDisplayCategory(viewProfile, 1, categoryMid.getName());
        assertThat(viewProfile.getSkills().get(1).getDisplayCategory()).isEqualTo(categoryMid);
    }

    /**
     * Validates that the new display category also is part of the {@link ViewProfile#displayCategories} collection
     * and the old one gets properly removed.
     */
    @Test
    public void displayCategoryShouldChangeInList() {
        Category oldCategory = Category.builder().name("Old").build();
        Category newCategory = Category.builder().name("New").parent(oldCategory).build();
        Skill skill = Skill.builder().name("Skill").category(newCategory).displayCategory(oldCategory).build();
        viewProfile.getDisplayCategories().add(oldCategory);
        viewProfile.getSkills().add(skill);
        // Precondition to this test
        assertThat(viewProfile.getDisplayCategories()).doesNotContain(newCategory);
        viewProfileService.setDisplayCategory(viewProfile, 0, newCategory.getName());
        // Postconditions
        assertThat(viewProfile.getDisplayCategories()).doesNotContain(oldCategory);
        assertThat(viewProfile.getDisplayCategories()).contains(newCategory);
    }

    /**
     * Valdiates that an exception is thrown in one of the following cases:
     * A) The provided category name is not part of the category branch the skill is in
     * B) The provided category name does not reflect any existing category
     * both cases are, in terms of implementation, identical. One test suffices.
     */
    @Test(expected = DisplayCategoryNotFoundException.class)
    public void shouldThrowExceptionDueToWrongCategory() {
        Category category = Category.builder().name("Category1").build();
        Skill skill = Skill.builder().name("Skill").category(category).displayCategory(category).build();
        viewProfile.getSkills().add(skill);
        viewProfileService.setDisplayCategory(viewProfile, 0, "FooBarCategory123");
    }
}
