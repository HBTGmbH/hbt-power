package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
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

import java.util.ArrayList;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@RunWith(SpringJUnit4ClassRunner.class)
public class DisplayCategoryTest {
    private ViewProfileOperationService viewProfileService;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    @MockBean
    private SkillServiceClient skillServiceClient;

    private ViewProfile viewProfile;

    private String category1Name = "Category1";
    private String category2Name = "Category2";
    private String category3Name = "Category3";
    private String skill1Name = "Skill1";
    private String skill2Name = "Skill2";

    private Category category1 = Category.builder().name(category1Name).enabled(true).isDisplay(true).id(1L).displaySkills(new ArrayList<>()).build();
    private Category category2 = Category.builder().name(category2Name).enabled(true).isDisplay(true).id(2L).displaySkills(new ArrayList<>()).build();
    private Skill skill1 = Skill.builder().name(skill1Name).id(1L).displayCategory(category1).build();
    private Skill skill2 = Skill.builder().name(skill2Name).id(2L).displayCategory(category2).build();

    private void makeViewProfile() {

        viewProfile = new ViewProfile();
        viewProfile.getDisplayCategories().add(category1);
        viewProfile.getDisplayCategories().add(category2);
    }

    @Before
    public void setUp() {
        viewProfileService = new ViewProfileOperationService(viewProfileRepository, skillServiceClient);
        makeViewProfile();
    }

    private void shouldReturnSkillServiceSkill(SkillServiceSkill skill) {
        when(skillServiceClient.getSkillByName(skill.getQualifier())).thenReturn(skill);
    }

    /**
     * A display category can be changed and is changed to the correct category, a display category above the skill
     */
    @Test
    public void displayCategoryShouldChange() {
        shouldReturnSkillServiceSkill(makeServiceSkill());
        viewProfile = viewProfileService.setDisplayCategory(viewProfile, skill1Name, category3Name);

        assertThat(viewProfile.findSkillByName(skill1Name).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(skill1Name).get().getDisplayCategory().getName()).isEqualTo(category3Name);
    }


    /**
     * Into a category the view profile doesn't have yet: the skill is in it once (#160)
     */
    @Test
    public void skillIsOnceInANewDisplayCategory() {
        shouldReturnSkillServiceSkill(makeServiceSkill());
        viewProfile = viewProfileService.setDisplayCategory(viewProfile, skill1Name, category3Name);

        Category category3 = viewProfile.getDisplayCategories().stream()
                .filter(category -> category.getName().equals(category3Name)).findFirst().orElseThrow(AssertionError::new);
        assertThat(category3.getDisplaySkills()).extracting(Skill::getName).containsExactly(skill1Name);
        assertThat(category3.getEnabled()).isTrue();
        assertThat(viewProfile.findSkillByName(skill1Name).get().getDisplayCategory()).isSameAs(category3);
        // The old category lost its only skill and is gone
        assertThat(viewProfile.getDisplayCategories()).extracting(Category::getName).doesNotContain(category1Name);
    }

    /**
     * Into a category the view profile has: the skill is in it once, and points to that category (#160)
     */
    @Test
    public void skillIsOnceInAnExistingDisplayCategory() {
        SkillServiceCategory serviceCategory2 = new SkillServiceCategory(category2Name, null, true);
        serviceCategory2.setId(2);
        SkillServiceCategory serviceCategory1 = new SkillServiceCategory(category1Name, serviceCategory2, true);
        serviceCategory1.setId(1);
        shouldReturnSkillServiceSkill(new SkillServiceSkill(skill1Name, serviceCategory1));

        viewProfile = viewProfileService.setDisplayCategory(viewProfile, skill1Name, category2Name);

        assertThat(category2.getDisplaySkills()).extracting(Skill::getName).containsExactly(skill2Name, skill1Name);
        assertThat(viewProfile.findSkillByName(skill1Name).get().getDisplayCategory()).isSameAs(category2);
        assertThat(viewProfile.getDisplayCategories()).containsExactly(category2);
    }

    /**
     * Only display categories of the skill tree (#197): a category above the skill that is not marked is refused, and
     * the skill stays where it is
     */
    @Test
    public void aCategoryThatIsNoDisplayCategoryIsRefused() {
        SkillServiceCategory notMarked = new SkillServiceCategory(5, "NotMarked");
        SkillServiceCategory cat1 = new SkillServiceCategory(category1Name, notMarked, true);
        cat1.setId(1);
        shouldReturnSkillServiceSkill(new SkillServiceSkill(skill1Name, cat1));

        assertThatThrownBy(() -> viewProfileService.setDisplayCategory(viewProfile, skill1Name, "NotMarked"))
                .isInstanceOf(DisplayCategoryNotFoundException.class);
        assertThat(viewProfile.findSkillByName(skill1Name).get().getDisplayCategory()).isSameAs(category1);
    }

    /**
     * A name that is none of the skill's categories: the exception meant for it, no NullPointerException (#197)
     */
    @Test
    public void aCategoryThatIsNotAboveTheSkillIsRefused() {
        shouldReturnSkillServiceSkill(makeServiceSkill());

        assertThatThrownBy(() -> viewProfileService.setDisplayCategory(viewProfile, skill1Name, "Elsewhere"))
                .isInstanceOf(DisplayCategoryNotFoundException.class);
    }

    /**
     * The display categories a skill can be shown in, from its own upwards, without the ones not marked (#197)
     */
    @Test
    public void parentsAreTheDisplayCategoriesAboveTheSkill() {
        SkillServiceCategory top = new SkillServiceCategory("Top", null, true);
        top.setId(10);
        SkillServiceCategory notMarked = new SkillServiceCategory("NotMarked", top, false);
        notMarked.setId(11);
        SkillServiceCategory own = new SkillServiceCategory("Own", notMarked, true);
        own.setId(12);
        shouldReturnSkillServiceSkill(new SkillServiceSkill(skill1Name, own));

        assertThat(viewProfileService.getParentsForSkill(skill1Name).values()).extracting(Category::getName)
                .containsExactly("Own", "Top");
    }

    private SkillServiceSkill makeServiceSkill() {
        SkillServiceCategory cat3 = new SkillServiceCategory(category3Name, null, true);
        cat3.setId(3);
        SkillServiceCategory cat1 = new SkillServiceCategory(category1Name, cat3, true);
        cat1.setId(4);

        SkillServiceSkill skill = new SkillServiceSkill(skill1Name, cat1);
        return skill;
    }

}
