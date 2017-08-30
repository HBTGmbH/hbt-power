package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.apache.commons.codec.language.bm.Lang;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileSortServiceTest {

    private ViewProfileSortService viewProfileSortService;

    private ViewProfile viewProfile;

    @Before
    public void setUp() {
        viewProfile = new ViewProfile();
        viewProfileSortService = new ViewProfileSortService();
    }

    @SuppressWarnings("unchecked")
    private void performSortAndAssert(NameComparableEntryType nameComparableEntryType, NameComparable o1, NameComparable o2, NameComparable o3) {
        viewProfileSortService.sortEntryByName(viewProfile, nameComparableEntryType, true);
        assertThat((List)nameComparableEntryType.getComparable(viewProfile)).containsExactly(o1, o2, o3);
        viewProfileSortService.sortEntryByName(viewProfile,nameComparableEntryType, false);
        assertThat((List)nameComparableEntryType.getComparable(viewProfile)).containsExactly(o3, o2, o1);
    }

    @Test
    public void languagesShouldBeSortedByName() {
        Language lang1 = Language.builder().name("L1").build();
        Language lang2 = Language.builder().name("L2").build();
        Language lang3 = Language.builder().name("L3").build();
        viewProfile.getLanguages().addAll(Arrays.asList(lang2, lang1, lang3));
        performSortAndAssert(NameComparableEntryType.LANGUAGE, lang1, lang2, lang3);
    }

    @Test
    public void qualificationShouldBeSortableByName() {
        Qualification o1 = Qualification.builder().name("O1").build();
        Qualification o2 = Qualification.builder().name("O2").build();
        Qualification o3 = Qualification.builder().name("O3").build();
        viewProfile.getQualifications().addAll(Arrays.asList(o2, o1, o3));
        performSortAndAssert(NameComparableEntryType.QUALIFICATION, o1, o2, o3);
    }

    @Test
    public void TrainingShouldBeSortableByName() {
        Training o1 = Training.builder().name("O1").build();
        Training o2 = Training.builder().name("O2").build();
        Training o3 = Training.builder().name("O3").build();
        viewProfile.getTrainings().addAll(Arrays.asList(o2, o1, o3));
        performSortAndAssert(NameComparableEntryType.TRAINING, o1, o2, o3);
    }

    @Test
    public void EducationShouldBeSortableByName() {
        Education o1 = Education.builder().name("O1").build();
        Education o2 = Education.builder().name("O2").build();
        Education o3 = Education.builder().name("O3").build();
        viewProfile.getEducations().addAll(Arrays.asList(o2, o1, o3));
        performSortAndAssert(NameComparableEntryType.EDUCATION, o1, o2, o3);
    }

    @Test
    public void SectorsShouldBeSortableByName() {
        Sector o1 = Sector.builder().name("O1").build();
        Sector o2 = Sector.builder().name("O2").build();
        Sector o3 = Sector.builder().name("O3").build();
        viewProfile.getSectors().addAll(Arrays.asList(o2, o1, o3));
        performSortAndAssert(NameComparableEntryType.SECTOR, o1, o2, o3);
    }

    @Test
    public void KeySkillsShouldBeSortableByName() {
        KeySkill o1 = KeySkill.builder().name("O1").build();
        KeySkill o2 = KeySkill.builder().name("O2").build();
        KeySkill o3 = KeySkill.builder().name("O3").build();
        viewProfile.getKeySkills().addAll(Arrays.asList(o2, o1, o3));
        performSortAndAssert(NameComparableEntryType.KEY_SKILL, o1, o2, o3);
    }

    @Test
    public void CareerShouldBeSortableByName() {
        Career o1 = Career.builder().name("O1").build();
        Career o2 = Career.builder().name("O2").build();
        Career o3 = Career.builder().name("O3").build();
        viewProfile.getCareers().addAll(Arrays.asList(o2, o1, o3));
        performSortAndAssert(NameComparableEntryType.CAREER, o1, o2, o3);
    }

    @Test
    public void ProjectRolesShouldBeSortableByName() {
        ProjectRole o1 = ProjectRole.builder().name("O1").build();
        ProjectRole o2 = ProjectRole.builder().name("O2").build();
        ProjectRole o3 = ProjectRole.builder().name("O3").build();
        viewProfile.getProjectRoles().addAll(Arrays.asList(o2, o1, o3));
        performSortAndAssert(NameComparableEntryType.PROJECT_ROLE, o1, o2, o3);
    }

    @Test
    public void DisplayCategoriesShouldBeSortedByName() {
        Category categoryA = Category.builder().name("A").build();
        Category categoryB = Category.builder().name("B").build();
        Category categoryC = Category.builder().name("C").build();
        viewProfile.getDisplayCategories().addAll(Arrays.asList(categoryB, categoryA, categoryC));
        performSortAndAssert(NameComparableEntryType.DISPLAY_CATEGORY, categoryA, categoryB, categoryC);
    }

}