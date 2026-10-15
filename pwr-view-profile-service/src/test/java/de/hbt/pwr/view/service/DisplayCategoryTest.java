package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
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
     * A display category can be changed and is changed to the correct category
     */
    @Test
    public void displayCategoryShouldChange() {
        shouldReturnSkillServiceSkill(makeServiceSkill());
        viewProfile = viewProfileService.setDisplayCategory(viewProfile, skill1Name, category3Name);

        assertThat(viewProfile.findSkillByName(skill1Name).isPresent()).isTrue();
        assertThat(viewProfile.findSkillByName(skill1Name).get().getDisplayCategory().getName()).isEqualTo(category3Name);
    }


    private SkillServiceSkill makeServiceSkill() {
        SkillServiceCategory cat3 = new SkillServiceCategory(3, category3Name);
        SkillServiceCategory cat1 = new SkillServiceCategory(category1Name, cat3, true);
        cat1.setId(4);

        SkillServiceSkill skill = new SkillServiceSkill(skill1Name, cat1);
        return skill;
    }

}
