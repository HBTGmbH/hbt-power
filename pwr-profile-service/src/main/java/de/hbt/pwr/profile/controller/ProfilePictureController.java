package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.security.ConsultantAccess;
import de.hbt.pwr.profile.service.PictureService;
import io.swagger.annotations.Api;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.concurrent.TimeUnit;

/**
 * Reading profile pictures; uploading and deleting them is for admins ({@link ProfilePictureAdminController}, #255)
 */
@Controller
@RequestMapping("profile-pictures")
@Api(value = "Profile picture resource")
public class ProfilePictureController {

    /**
     * A picture never changes under its id (a new picture gets a new one), so the browser may keep it. Private: it is
     * personal data, shared caches must not store it. Spring 5.2 has no CacheControl.immutable() yet.
     */
    static final String CACHE_PICTURE_BY_ID =
            CacheControl.maxAge(365, TimeUnit.DAYS).cachePrivate().getHeaderValue() + ", immutable";

    private final PictureService pictureService;
    private final ConsultantRepository consultantRepository;

    public ProfilePictureController(PictureService pictureService, ConsultantRepository consultantRepository) {
        this.pictureService = pictureService;
        this.consultantRepository = consultantRepository;
    }

    /**
     * A user gets the own picture only, an admin every one (#255)
     */
    @GetMapping("/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> getPicture(@PathVariable("id") String id) {
        ConsultantAccess.check(consultantRepository.findFirstByProfilePictureId(id).map(Consultant::getInitials).orElse(null));
        return pictureService.findProfilePicture(id)
                .map(picture -> withContentType(picture)
                        .header(HttpHeaders.CACHE_CONTROL, CACHE_PICTURE_BY_ID)
                        .body(picture.getImage()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-initials/{initials}")
    @ResponseBody
    public ResponseEntity<byte[]> getPictureByInitials(@PathVariable("initials") String initials) {
        return pictureService.findByInitials(initials)
                .map(picture -> withContentType(picture).body(picture.getImage()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private ResponseEntity.BodyBuilder withContentType(ProfilePicture profilePicture) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.parseMediaType(profilePicture.getContentType()));
    }
}
