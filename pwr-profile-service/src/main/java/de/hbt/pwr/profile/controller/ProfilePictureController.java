package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.service.PictureService;
import io.swagger.annotations.Api;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

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

    public ProfilePictureController(PictureService pictureService) {
        this.pictureService = pictureService;
    }

    @GetMapping("/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> getPicture(@PathVariable("id") String id) {
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

    @PostMapping(value = "", produces = APPLICATION_JSON_VALUE, consumes = MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<ProfilePicture> uploadPicture(@RequestParam("file") MultipartFile multipartFile) {
        var result = pictureService.uploadPicture(multipartFile);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePicture(@PathVariable("id") String id) {
        pictureService.deletePicture(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity.BodyBuilder withContentType(ProfilePicture profilePicture) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.parseMediaType(profilePicture.getContentType()));
    }
}
