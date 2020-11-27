package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.service.PictureService;
import io.swagger.annotations.Api;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@Controller
@RequestMapping("profile-pictures")
@Api(value = "Profile picture resource")
public class ProfilePictureController {

    private final PictureService pictureService;

    public ProfilePictureController(PictureService pictureService) {
        this.pictureService = pictureService;
    }

    @GetMapping("/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> getPicture(@PathVariable("id") String id) {
        return pictureService.findProfilePicture(id)
                .map(this::toResponse)
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

    private ResponseEntity<byte[]> toResponse(ProfilePicture profilePicture) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.parseMediaType(profilePicture.getContentType()))
                .body(profilePicture.getImage());
    }
}
