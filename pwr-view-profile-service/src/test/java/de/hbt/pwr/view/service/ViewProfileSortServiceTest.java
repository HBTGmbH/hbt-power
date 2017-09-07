package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparable;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparableEntryType;
import de.hbt.pwr.view.model.skill.Category;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;
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

    @SuppressWarnings("unchecked")
    private void performStartEndDateSortAssert(StartEndDateComparableEntryType entryType,
                                               StartEndDateComparable o1,
                                               StartEndDateComparable o2,
                                               StartEndDateComparable o3) {
        viewProfileSortService.sortEntryByStartDate(viewProfile, entryType, true);
        assertThat((List)entryType.getComparable(viewProfile)).containsExactly(o1, o2, o3);
        viewProfileSortService.sortEntryByStartDate(viewProfile, entryType, false);
        assertThat((List)entryType.getComparable(viewProfile)).containsExactly(o3, o2, o1);

        viewProfileSortService.sortEntryByEndDate(viewProfile, entryType, true);
        assertThat((List)entryType.getComparable(viewProfile)).containsExactly(o1, o2, o3);
        viewProfileSortService.sortEntryByEndDate(viewProfile, entryType, false);
        assertThat((List)entryType.getComparable(viewProfile)).containsExactly(o3, o2, o1);
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
        Category categoryA = new Category("A");
        Category categoryB = new Category("B");
        Category categoryC = new Category("C");
        viewProfile.getDisplayCategories().addAll(Arrays.asList(categoryB, categoryA, categoryC));
        performSortAndAssert(NameComparableEntryType.DISPLAY_CATEGORY, categoryA, categoryB, categoryC);
    }

    @Test
    public void EducationShouldBeDateSorted() {
        Education ed1 = Education.builder().name("E1")
                .startDate(LocalDate.of(2010, 3, 3))
                .endDate(LocalDate.of(2010, 4,4)).build();
        Education ed2 = Education.builder().name("E2")
                .startDate(LocalDate.of(2011, 3, 3))
                .endDate(LocalDate.of(2011, 4,4)).build();
        Education ed3 = Education.builder().name("E1")
                .startDate(LocalDate.of(2012, 3, 3))
                .endDate(LocalDate.of(2012, 4,4)).build();
        viewProfile.getEducations().addAll(Arrays.asList(ed2, ed1, ed3));
        performStartEndDateSortAssert(StartEndDateComparableEntryType.EDUCATION, ed1, ed2, ed3);
    }

    @Test
    public void CareerShouldBeDateSorted() {
        Career ed1 = Career.builder().name("E1")
                .startDate(LocalDate.of(2010, 3, 3))
                .endDate(LocalDate.of(2010, 4,4)).build();
        Career ed2 = Career.builder().name("E2")
                .startDate(LocalDate.of(2011, 3, 3))
                .endDate(LocalDate.of(2011, 4,4)).build();
        Career ed3 = Career.builder().name("E1")
                .startDate(LocalDate.of(2012, 3, 3))
                .endDate(LocalDate.of(2012, 4,4)).build();
        viewProfile.getCareers().addAll(Arrays.asList(ed2, ed1, ed3));
        performStartEndDateSortAssert(StartEndDateComparableEntryType.CAREER, ed1, ed2, ed3);
    }

    @Test
    public void ProjectShouldBeDateSorted() {
        Project ed1 = Project.builder().name("E1")
                .startDate(LocalDate.of(2010, 3, 3))
                .endDate(LocalDate.of(2010, 4,4)).build();
        Project ed2 = Project.builder().name("E2")
                .startDate(LocalDate.of(2011, 3, 3))
                .endDate(LocalDate.of(2011, 4,4)).build();
        Project ed3 = Project.builder().name("E1")
                .startDate(LocalDate.of(2012, 3, 3))
                .endDate(LocalDate.of(2012, 4,4)).build();
        viewProfile.getProjects().addAll(Arrays.asList(ed2, ed1, ed3));
        performStartEndDateSortAssert(StartEndDateComparableEntryType.PROJECT, ed1, ed2, ed3);
    }

    @Test
    public void TrainingShouldBeDateSorted() {
        Training ed1 = Training.builder().name("E1")
                .startDate(LocalDate.of(2010, 3, 3))
                .endDate(LocalDate.of(2010, 4,4)).build();
        Training ed2 = Training.builder().name("E2")
                .startDate(LocalDate.of(2011, 3, 3))
                .endDate(LocalDate.of(2011, 4,4)).build();
        Training ed3 = Training.builder().name("E1")
                .startDate(LocalDate.of(2012, 3, 3))
                .endDate(LocalDate.of(2012, 4,4)).build();
        viewProfile.getTrainings().addAll(Arrays.asList(ed2, ed1, ed3));
        performStartEndDateSortAssert(StartEndDateComparableEntryType.TRAINING, ed1, ed2, ed3);
    }

}