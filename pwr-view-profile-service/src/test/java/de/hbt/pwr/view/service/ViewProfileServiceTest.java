package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.exception.CategoryNotFoundException;
import de.hbt.pwr.view.exception.CategoryNotUniqueException;
import de.hbt.pwr.view.exception.InvalidOwnerException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import de.hbt.pwr.view.util.PwrListUtil;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Optional.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.*;

/**
 * Tests that validate general behaviour of the {@link ViewProfileOperationService}
 */
@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileServiceTest {

    private ViewProfileOperationService viewProfileService;

    @MockBean
    private ViewProfileRepository viewProfileRepository;
    @MockBean
    private SkillServiceClient skillServiceClient;

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
        given(viewProfileRepository.findAll()).willReturn(PwrListUtil.union(testViewProfileListOfTestUser, testViewProfilesOfOtherUser));
        testViewProfileListOfTestUser.forEach(viewProfile -> given(viewProfileRepository.findById(viewProfile.getId())).willReturn(of(viewProfile)));
        testViewProfilesOfOtherUser.forEach(viewProfile -> given(viewProfileRepository.findById(viewProfile.getId())).willReturn(of(viewProfile)));
        viewProfileService = new ViewProfileOperationService(viewProfileRepository, skillServiceClient);
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
        verify(viewProfileRepository, times(1)).deleteById("VP1");
    }

    @Test(expected = InvalidOwnerException.class)
    public void shouldNotDeleteAndThrowInvalidOwner() {
        viewProfileService.deleteWithOwnerCheck("VP4", otherUserInitials);
        verify(viewProfileRepository, times(0)).deleteById("VP4");
    }

    @Test(expected = ViewProfileNotFoundException.class)
    public void shouldNotDeleteAndThrowNotFound() {
        viewProfileService.deleteWithOwnerCheck("FooBar", otherUserInitials);
        verify(viewProfileRepository, times(0)).deleteById("FooBar");
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
    public void shouldPartiallyUpdateViewProfileInfo() {
        ViewProfile viewProfile = new ViewProfile();
        ViewProfileInfo viewProfileInfo = ViewProfileInfo.builder().name("adad")
                .viewDescription("Desc")
                .consultantBirthDate(LocalDate.now())
                .consultantName("Name").build();
        viewProfileService.updateInfo(viewProfile, viewProfileInfo);
        ViewProfileInfo updatedInfo = viewProfile.getViewProfileInfo();
        assertThat(updatedInfo.getConsultantBirthDate()).isEqualTo(viewProfileInfo.getConsultantBirthDate());
        assertThat(updatedInfo.getConsultantName()).isEqualTo(viewProfileInfo.getConsultantName());
        assertThat(updatedInfo.getName()).isEqualTo(viewProfileInfo.getName());
        assertThat(updatedInfo.getViewDescription()).isEqualTo(viewProfileInfo.getViewDescription());

    }
}
