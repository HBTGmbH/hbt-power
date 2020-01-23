package de.hbt.pwr.view.aspects;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.assertj.core.groups.Tuple;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;

public class ViewProfileRestoreAspectTest {

    private List<Category> executeMerge(List<Category> categories) {
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setDisplayCategories(categories);
        new ViewProfileRestoreAspect().restore(viewProfile);
        return viewProfile.getDisplayCategories();
    }

    @Test
    public void shouldMergeDuplicates_intoOneCategory() {
        Category categoryA = Category.builder()
                .id(5L)
                .name("Technology")
                .isDisplay(true)
                .displaySkills(singletonList(Skill.builder().name("Java").id(4L).rating(2).build()))
                .build();
        Category categoryB = Category.builder()
                .id(5L)
                .name("Technology")
                .isDisplay(true)
                .displaySkills(singletonList(Skill.builder().name("JavaScript").id(4L).rating(2).build()))
                .build();
        List<Category> merged = executeMerge(Arrays.asList(categoryA, categoryB));
        assertThat(merged).hasSize(1);
        assertThat(merged)
                .extracting(Category::getName, Category::getId)
                .containsExactly(Tuple.tuple("Technology", 5L));
    }

    @Test
    public void shouldKeepOrder_whenMergingDuplicates() {
        Category categoryA = Category.builder().id(532563L).isDisplay(true).name("Test 1").displaySkills(singletonList(Skill.builder().name("SKillA").id(44L).build())).build();
        Category categoryB = Category.builder().id(60435L).isDisplay(true).name("Test 2").displaySkills(singletonList(Skill.builder().name("SkillB").id(55L).build())).build();
        Category categoryC = Category.builder().id(77873L).isDisplay(true).name("Test 3").displaySkills(singletonList(Skill.builder().name("SkillC").id(66L).build())).build();
        // Testing order sucks. Sometimes it works, sometimes not.
        for (int i = 0; i < 100; i++) {
            ArrayList<Category> categories = new ArrayList<>(Arrays.asList(categoryA, categoryB, categoryC));
            Collections.shuffle(categories);
            List<Category> mergeDuplicates = executeMerge(categories);
            assertThat(mergeDuplicates).isEqualTo(categories);
        }
    }
}
