package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.service.PictureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

/**
 * Uploading and deleting profile pictures, which only the consultant management does (#255); the edge restricts
 * <code>/admin/**</code> to <code>Power.Admin</code>
 */
@RestController
@RequestMapping("/admin/profile-pictures")
public class ProfilePictureAdminController {

    private final PictureService pictureService;

    public ProfilePictureAdminController(PictureService pictureService) {
        this.pictureService = pictureService;
    }

    @PostMapping(value = "", produces = APPLICATION_JSON_VALUE, consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfilePicture> uploadPicture(@RequestParam("file") MultipartFile multipartFile) {
        return ResponseEntity.ok(pictureService.uploadPicture(multipartFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePicture(@PathVariable("id") String id) {
        pictureService.deletePicture(id);
        return ResponseEntity.noContent().build();
    }
}
