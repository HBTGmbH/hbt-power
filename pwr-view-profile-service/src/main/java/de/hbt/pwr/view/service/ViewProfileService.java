package de.hbt.pwr.view.service;

import de.hbt.pwr.view.exception.InvalidOwnerException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.springframework.data.util.StreamUtils;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViewProfileService {

    private final ViewProfileRepository viewProfileRepository;

    public ViewProfileService(ViewProfileRepository viewProfileRepository) {
        this.viewProfileRepository = viewProfileRepository;
    }

    @NotNull
    public List<ViewProfile> getViewProfileIdsForInitials(@NotNull String initials) {
        return StreamUtils.createStreamFromIterator(viewProfileRepository.findAll().iterator())
                .filter(viewProfile -> viewProfile.getOwnerInitials().equals(initials))
                .collect(Collectors.toList());
    }

    @NotNull
    public ViewProfile getByIdAndCheckOwner(@NotNull String id, @NotNull String owner) {
        ViewProfile viewProfile = viewProfileRepository.findOne(id);
        if(viewProfile == null) {
            throw new ViewProfileNotFoundException(id);
        }
        if(!viewProfile.getOwnerInitials().equals(owner)) {
            throw new InvalidOwnerException(id, owner);
        }
        return viewProfile;
    }


    public void deleteWithOwnerCheck(@NotNull String id, @NotNull String owner) {
        ViewProfile viewProfile = viewProfileRepository.findOne(id);
        if(viewProfile == null) {
            throw new ViewProfileNotFoundException(id);
        }
        if(!viewProfile.getOwnerInitials().equals(owner)) {
            throw new InvalidOwnerException(id, owner);
        }
        viewProfileRepository.delete(id);
    }
}
