package de.hbt.pwr.view.service;

import de.hbt.pwr.view.exception.CategoryNotFoundException;
import de.hbt.pwr.view.exception.CategoryNotUniqueException;
import de.hbt.pwr.view.exception.InvalidOwnerException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.apache.commons.collections.ListUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.*;

/**
 * Tests that validate general behaviour of the {@link ViewProfileService}
 */
@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileServiceTest {

    private ViewProfileService viewProfileService;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    private final String testUserInitials = "tst";

    private final String otherUserInitials = "oth";

    private final List<ViewProfile> testViewProfileListOfTestUser = Arrays.asList(
            ViewProfile.builder().viewProfileInfo(ViewProfileInfo.builder().name("VP1").ownerInitials(testUserInitials).build()).id("VP1").build(),
            ViewProfile.builder().viewProfileInfo(ViewProfileInfo.builder().name("VP2").ownerInitials(testUserInitials).build()).id("VP2").build(),
            ViewProfile.builder().viewProfileInfo(ViewProfileInfo.builder().name("VP3").ownerInitials(testUserInitials).build()).id("VP3").build(),
            ViewProfile.builder().viewProfileInfo(ViewProfileInfo.builder().name("VP4").ownerInitials(testUserInitials).build()).id("VP4").build()
    );

    private final List<ViewProfile> testViewProfilesOfOtherUser = Arrays.asList(
            ViewProfile.builder().viewProfileInfo(ViewProfileInfo.builder().name("O1").ownerInitials(otherUserInitials).build()).id("O1").build(),
            ViewProfile.builder().viewProfileInfo(ViewProfileInfo.builder().name("O2").ownerInitials(otherUserInitials).build()).id("O2").build()
    );

    @Before
    public void setUp() {
        //noinspection unchecked
        given(viewProfileRepository.findAll()).willReturn(ListUtils.union(testViewProfileListOfTestUser, testViewProfilesOfOtherUser));
        testViewProfileListOfTestUser.forEach(viewProfile -> given(viewProfileRepository.findOne(viewProfile.getId())).willReturn(viewProfile));
        testViewProfilesOfOtherUser.forEach(viewProfile -> given(viewProfileRepository.findOne(viewProfile.getId())).willReturn(viewProfile));
        viewProfileService = new ViewProfileService(viewProfileRepository);
    }

    @Test
    public void shouldReturnAllExistingViewProfileIdsForTestUser() {
        List<String> viewProfileIds = viewProfileService.getViewProfileIdsForInitials(testUserInitials);
        List<String> expectedIds = testViewProfileListOfTestUser.stream().map(ViewProfile::getId).collect(Collectors.toList());
        assertThat(viewProfileIds).containsAll(expectedIds);
    }

    @Test
    public void shouldReturnViewProfileForCorrectOwner() {
        viewProfileService.getByIdAndCheckOwner("VP1", testUserInitials);
    }

    @Test(expected = InvalidOwnerException.class)
    public void shouldThrowExceptionBecauseOfInvalidOwner() {
        viewProfileService.getByIdAndCheckOwner("VP1", otherUserInitials);
    }

    @Test(expected = ViewProfileNotFoundException.class)
    public void shouldThrowExceptionBecauseViewProfileDoesNotExist() {
        viewProfileService.getByIdAndCheckOwner("FooBar", otherUserInitials);
    }

    @Test
    public void shouldDeleteViewProfile() {
        viewProfileService.deleteWithOwnerCheck("VP1", testUserInitials);
        verify(viewProfileRepository, times(1)).delete("VP1");
    }

    @Test(expected = InvalidOwnerException.class)
    public void shouldNotDeleteAndThrowInvalidOwner() {
        viewProfileService.deleteWithOwnerCheck("VP4", otherUserInitials);
        verify(viewProfileRepository, times(0)).delete("VP4");
    }

    @Test(expected = ViewProfileNotFoundException.class)
    public void shouldNotDeleteAndThrowNotFound() {
        viewProfileService.deleteWithOwnerCheck("FooBar", otherUserInitials);
        verify(viewProfileRepository, times(0)).delete("FooBar");
    }

    @Test
    public void shouldChangeDescription() {
        final String oldDescription = "FizzBuzz";
        final String newDescription = "FooBar";
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setDescription(oldDescription);
        viewProfileService.setDescription(viewProfile, newDescription);
        assertThat(viewProfile.getDescription()).isEqualTo(newDescription);
    }

    @Test
    public void shouldHaveAddedNewCategory() {
        Category category = new Category("Category1");//Category.builder().name("Category1").build();
        Category newCategoryParent = new Category("Category2");
        String newCategoryName = "Category3";
        newCategoryParent.setParent(category);
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(category);

        viewProfileService.addNewCategory(viewProfile, newCategoryParent.getName(), newCategoryName);

        Category newCategory = viewProfile.getRootCategory().getChildren().get(0).getChildren().get(0);
        assertThat(newCategory.getName()).isEqualTo(newCategoryName);
        assertThat(newCategory.getParent()).isEqualTo(newCategoryParent);
    }

    @Test(expected = CategoryNotUniqueException.class)
    public void shouldThrowBecauseNameAlreadyExist() {
        final String category1Name = "Category1";
        final String category2Name = "Category2";
        final Category category1 = new Category(category1Name);
        final Category category2 = new Category(category2Name);
        final Category root = new Category("root");
        category1.setParent(root);
        category2.setParent(root);
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(root);

        viewProfileService.addNewCategory(viewProfile, category1Name, category2Name);
    }

    @Test(expected = CategoryNotFoundException.class)
    public void shouldThrowBecauseParentDoesNotExist() {
        final String category1Name = "Category1";
        final String category2Name = "Category2";
        final Category category1 = new Category(category1Name);
        final Category category2 = new Category(category2Name);
        final Category root = new Category("root");
        category1.setParent(root);
        category2.setParent(root);
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(root);
        viewProfileService.addNewCategory(viewProfile, "düpämölv", "afsada");
    }

    @Test
    public void shouldMoveSkill() {
        Category root = new Category("root");
        Category oldCategory = new Category("old", root);
        Category newCategory = new Category("new", root);
        Skill skill = Skill.builder().name("skill").category(oldCategory).build();

        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(root);

        viewProfileService.moveSkill(viewProfile, skill.getName(), newCategory.getName());

        assertThat(oldCategory.getSkills()).isEmpty();
        assertThat(newCategory.getSkills()).containsExactly(skill);
    }

    @Test
    public void shouldSetDisplayCategoryForMovedSkill() {
        Category root = new Category(ViewProfileImporter.PWR_ROOT_NAME);
        Category oldCategory = new Category("old", root);
        Category newCategory = new Category("new", root);
        Skill skill = Skill.builder().name("skill").category(oldCategory).displayCategory(oldCategory).build();

        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(root);

        viewProfileService.moveSkill(viewProfile, skill.getName(), newCategory.getName());

        assertThat(skill.getDisplayCategory()).isEqualTo(newCategory);
        assertThat(newCategory.getDisplaySkills()).containsExactly(skill);
        assertThat(newCategory.getSkills()).containsExactly(skill);
        assertThat(oldCategory.getDisplaySkills()).doesNotContain(skill);
        assertThat(oldCategory.getSkills()).doesNotContain(skill);
    }

    @Test(expected = CategoryNotFoundException.class)
    public void shouldThrowNotFoundForUnknownCategory() {
        Category root = new Category(ViewProfileImporter.PWR_ROOT_NAME);
        Skill skill = Skill.builder().name("skill").category(root).displayCategory(root).build();

        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setRootCategory(root);
        viewProfileService.moveSkill(viewProfile, skill.getName(), "asdasfjdapofj");
    }
}