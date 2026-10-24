package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfilePictureRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ProfilePicture;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.ResourceAccessException;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Deleting a consultant deletes everything about the consultant, in the other services too (#240)
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class ConsultantDeleteITest extends AbstractIntegrationTest {

    @Autowired
    private ConsultantService consultantService;
    @Autowired
    private ConsultantRepository consultantRepository;
    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    private ProfilePicture picture;

    @Before
    public void setUp() {
        ProfilePicture newPicture = new ProfilePicture();
        newPicture.setImage(new byte[]{1, 2, 3});
        newPicture.setContentType("image/png");
        picture = profilePictureRepository.saveAndFlush(newPicture);
        Consultant consultant = consultantService.createNewConsultant("old", "Olga", "Alt", null, picture.getId(),
                LocalDate.of(1990, 1, 1));
        consultant.setActive(false);
        consultantRepository.saveAndFlush(consultant);
        when(viewProfileClient.getAllViewProfiles("old")).thenReturn(List.of("v1", "v2"));
    }

    @Test
    public void deletesTheViewProfilesTheDocumentsAndThePicture_andRefreshesTheStatistics() {
        consultantService.deleteConsultant("old");

        verify(viewProfileClient).deleteViewProfile("old", "v1");
        verify(viewProfileClient).deleteViewProfile("old", "v2");
        verify(reportClient).deleteAllReports("old");
        verify(statisticsClient).refreshConsultantsAfterCommit();
        assertThat(consultantRepository.findByInitials("old")).isEmpty();
        assertThat(profilePictureRepository.findById(picture.getId())).isEmpty();
    }

    @Test
    public void ifTheReportServiceFails_theConsultantStays() {
        doThrow(new ResourceAccessException("Connection refused")).when(reportClient).deleteAllReports(anyString());

        WebApplicationException error = catchThrowableOfType(() -> consultantService.deleteConsultant("old"),
                WebApplicationException.class);

        assertThat(error.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(consultantRepository.findByInitials("old")).isPresent();
        assertThat(profilePictureRepository.findById(picture.getId())).isPresent();
        verify(statisticsClient, never()).refreshConsultantsAfterCommit();
    }

    @Test
    public void ifTheViewProfileServiceFails_noDocumentIsDeleted_andTheConsultantStays() {
        doThrow(new ResourceAccessException("Connection refused")).when(viewProfileClient).deleteViewProfile("old", "v2");

        WebApplicationException error = catchThrowableOfType(() -> consultantService.deleteConsultant("old"),
                WebApplicationException.class);

        assertThat(error.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
        verify(reportClient, never()).deleteAllReports(anyString());
        assertThat(consultantRepository.findByInitials("old")).isPresent();
    }

    @Test
    public void anActiveConsultant_isNotDeleted() {
        consultantService.createNewConsultant("act", "Aktiv", "Aktiv", null, null, LocalDate.of(1990, 1, 1));

        WebApplicationException error = catchThrowableOfType(() -> consultantService.deleteConsultant("act"),
                WebApplicationException.class);

        assertThat(error.getStatus()).isEqualTo(HttpStatus.LOCKED);
        verifyNoInteractions(reportClient);
    }
}
