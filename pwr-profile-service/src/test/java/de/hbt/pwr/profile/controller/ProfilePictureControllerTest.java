package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.service.PictureService;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ProfilePictureControllerTest {

    private final PictureService pictureService = mock(PictureService.class);
    private final ProfilePictureController controller = new ProfilePictureController(pictureService, mock(ConsultantRepository.class));
    private final ProfilePicture picture = new ProfilePicture();

    @Before
    public void setUp() {
        picture.setId("some-id");
        picture.setContentType(MediaType.IMAGE_PNG_VALUE);
        picture.setImage(new byte[]{1, 2, 3});
    }

    @Test
    public void pictureByIdMayBeKeptByTheBrowserOnly() {
        when(pictureService.findProfilePicture("some-id")).thenReturn(Optional.of(picture));

        ResponseEntity<byte[]> response = controller.getPicture("some-id");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.IMAGE_PNG);
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("max-age=31536000, private, immutable");
        assertThat(response.getBody()).containsExactly(1, 2, 3);
    }

    @Test
    public void missingPictureIsNotFoundAndNotCached() {
        when(pictureService.findProfilePicture("missing")).thenReturn(Optional.empty());

        ResponseEntity<byte[]> response = controller.getPicture("missing");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getHeaders()).doesNotContainKey(HttpHeaders.CACHE_CONTROL);
    }

    @Test
    public void pictureByInitialsIsNotCached() {
        // The picture behind initials changes when a new one is uploaded
        when(pictureService.findByInitials("abc")).thenReturn(Optional.of(picture));

        ResponseEntity<byte[]> response = controller.getPictureByInitials("abc");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders()).doesNotContainKey(HttpHeaders.CACHE_CONTROL);
        assertThat(response.getBody()).containsExactly(1, 2, 3);
    }
}
