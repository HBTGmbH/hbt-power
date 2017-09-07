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

import java.util.Optional;

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

    @SuppressWarnings("ConstantConditions")
    private Skill getSkillOrFail(String name) {
        Optional<Skill> resultOptional = viewProfile.findSkillByName(name);
        assertThat(resultOptional.isPresent()).isTrue();
        return resultOptional.get();
    }

    /**
     * A display category can be changed and is changed to the correct category
     */
    @Test
    public void displayCategoryShouldChange() {
        Category category1 = new Category("Category1");
        Category category2 = new Category("Category2", category1);
        Skill skill = Skill.builder().name("Skill1").category(category2).displayCategory(category2).build();
        viewProfile.setRootCategory(category1);
        viewProfileService.setDisplayCategory(viewProfile, skill.getName(), category1.getName());

        Skill result = getSkillOrFail(skill.getName());
        assertThat(result.getDisplayCategory()).isEqualTo(category1);
    }

    /**
     * Checks that the display category can also be changed when the new display category
     * is lower in the hierarchy than the current display category.
     */
    @Test
    public void displayCategoryShouldChangeWithLowerOrderCategory() {
        Category categoryHighHigh= new Category("CategoryHighHigh");
        Category categoryHigh = new Category("CategoryHigh", categoryHighHigh);
        Category categoryMid = new Category("CategoryMid", categoryHigh);
        Category categoryLow = new Category("CategoryLow", categoryMid);
        Skill skill1 = Skill.builder().name("Skill").category(categoryLow).displayCategory(categoryHighHigh).build();
        Skill.builder().name("Skill2").category(categoryHighHigh).displayCategory(categoryHighHigh).build();
        viewProfile.setRootCategory(categoryHighHigh);

        viewProfileService.setDisplayCategory(viewProfile, skill1.getName(), categoryMid.getName());

        Skill result = getSkillOrFail(skill1.getName());
        assertThat(result.getDisplayCategory()).isEqualTo(categoryMid);
    }

    /**
     * Validates that the new display category also is part of the {@link ViewProfile#displayCategories} collection
     * and the old one gets properly removed.
     */
    @Test
    public void displayCategoryShouldChangeInList() {
        Category oldCategory = new Category("Old");
        Category newCategory = new Category("New", oldCategory);
        Skill skill = Skill.builder().name("Skill").category(newCategory).displayCategory(oldCategory).build();
        viewProfile.getDisplayCategories().add(oldCategory);
        viewProfile.setRootCategory(oldCategory);

        // Precondition to this test
        assertThat(viewProfile.getDisplayCategories()).doesNotContain(newCategory);
        Skill result = getSkillOrFail(skill.getName());
        viewProfileService.setDisplayCategory(viewProfile, result.getName(), newCategory.getName());
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
        Category category = new Category("Category1");
        Skill skill = Skill.builder().name("Skill").category(category).displayCategory(category).build();
        viewProfile.setRootCategory(category);
        Skill result = getSkillOrFail(skill.getName());
        viewProfileService.setDisplayCategory(viewProfile, result.getName(), "FooBarCategory123");
    }
}
