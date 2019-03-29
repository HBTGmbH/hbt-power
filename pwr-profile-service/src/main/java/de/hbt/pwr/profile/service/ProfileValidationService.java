package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.CareerElement;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collection;
import java.util.stream.Collectors;

import static java.util.stream.Stream.of;

@Service
public class ProfileValidationService {

    public Collection<String> validateProfile(Profile profile) {
        return of(profile.getCareerEntries(), profile.getTrainingEntries(), profile.getEducation())
                .flatMap(Collection::stream)
                .filter(this::hasInvalidStartEndDate)
                .map(this::toErrorMessage)
                .collect(Collectors.toList());
    }

    private String toErrorMessage(CareerElement careerEntry) {
        return String.format("%s '%s' has it's start date after the end date!", careerEntry.getClass().getSimpleName(), careerEntry.getNameEntity().getName());
    }

    private boolean hasInvalidStartEndDate(CareerElement careerElement) {
        return !areValidDates(careerElement.getStartDate(), careerElement.getEndDate());
    }

    private boolean areValidDates(LocalDate start, LocalDate end) {
        if (end == null) {
            return true;
        }
        if (start == null) {
            return false;
        }
        return start.isBefore(end) || start.isEqual(end);
    }
}
