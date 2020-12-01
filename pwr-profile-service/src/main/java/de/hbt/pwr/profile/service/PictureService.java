package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.ProfilePictureRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.ProfilePicture;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.IOException;
import java.util.Optional;

@Service
public class PictureService {

    private final ProfilePictureRepository profilePictureRepository;

    public PictureService(ProfilePictureRepository profilePictureRepository) {
        this.profilePictureRepository = profilePictureRepository;
    }

    @Transactional
    public ProfilePicture uploadPicture(MultipartFile multipartFile) {
        ProfilePicture profilePicture = new ProfilePicture();
        try {
            profilePicture.setImage(multipartFile.getBytes());
        } catch (IOException e) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "Invalid image content!");
        }
        profilePicture.setContentType(multipartFile.getContentType());
        return profilePictureRepository.saveAndFlush(profilePicture);
    }

    @Transactional
    public void deletePicture(String id) {
        profilePictureRepository.findById(id)
                .ifPresent(profilePictureRepository::delete);
    }

    public Optional<ProfilePicture> findProfilePicture(String id) {
        return profilePictureRepository.findById(id);
    }

    public Optional<ProfilePicture> findByInitials(String initials) {
        return profilePictureRepository.findByInitials(initials);
    }
}
