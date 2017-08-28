package de.hbt.pwr.view.service;

import de.hbt.pwr.view.exception.InvalidOwnerException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ViewProfile;
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

    private String testUserInitials = "tst";

    private String otherUserInitials = "oth";

    private final List<ViewProfile> testViewProfileListOfTestUser = Arrays.asList(
            ViewProfile.builder().name("VP1").id("VP1").ownerInitials(testUserInitials).build(),
            ViewProfile.builder().name("VP2").id("VP2").ownerInitials(testUserInitials).build(),
            ViewProfile.builder().name("VP3").id("VP3").ownerInitials(testUserInitials).build(),
            ViewProfile.builder().name("VP4").id("VP4").ownerInitials(testUserInitials).build()
    );

    private final List<ViewProfile> testViewProfilesOfOtherUser = Arrays.asList(
            ViewProfile.builder().name("O1").id("O1").ownerInitials(otherUserInitials).build(),
            ViewProfile.builder().name("O2").id("O2").ownerInitials(otherUserInitials).build()
    );

    @Before
    public void setUp() {
        //noinspection unchecked
        given(viewProfileRepository.findAll()).willReturn(ListUtils.union(testViewProfileListOfTestUser, testViewProfilesOfOtherUser));
        testViewProfileListOfTestUser.forEach(viewProfile -> {
            given(viewProfileRepository.findOne(viewProfile.getId())).willReturn(viewProfile);
        });
        testViewProfilesOfOtherUser.forEach(viewProfile -> {
            given(viewProfileRepository.findOne(viewProfile.getId())).willReturn(viewProfile);
        });
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
}