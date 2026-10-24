package de.hbt.pwr.view.service.housekeeping;

import de.hbt.pwr.view.model.HousekeepingFindings;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * Housekeeping, rubric <em>old</em> (#289): view profiles not changed and not exported for longer than
 * {@code pwr.housekeeping.old-view-profiles-after}. They are no left-overs, so deleting them is a decision of the
 * admin. The most recently used view profile of every consultant always stays; the consultant is not asked.
 * <p>
 * A view profile counts as used on the day it was created and on every day it was changed or exported
 * ({@link ViewProfileInfo#getLastUsed()}). Those from before #289 don't know when they were last used, so they count
 * as used on {@link #TRACKED_SINCE}: a view profile created years ago and exported last week must not look old.
 */
@Slf4j
@Service
public class OldViewProfilesService {

    public static final String OLD_VIEW_PROFILES = "old-view-profiles";

    /** Since then every change and export is recorded */
    static final LocalDate TRACKED_SINCE = LocalDate.of(2026, 10, 25);

    private final ViewProfileRepository viewProfileRepository;
    private final Duration oldAfter;

    public OldViewProfilesService(ViewProfileRepository viewProfileRepository,
                                  @Value("${pwr.housekeeping.old-view-profiles-after:730d}") Duration oldAfter) {
        this.viewProfileRepository = viewProfileRepository;
        this.oldAfter = oldAfter;
    }

    public List<HousekeepingFindings> check() {
        return List.of(HousekeepingFindings.of(OLD_VIEW_PROFILES, oldViewProfiles().stream()
                .map(OldViewProfilesService::describe).collect(Collectors.toList())));
    }

    /**
     * Deletes what the check finds right now; returns how many
     */
    public int clean(String check) {
        if (!OLD_VIEW_PROFILES.equals(check)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No housekeeping check " + check);
        }
        List<String> ids = oldViewProfiles().stream().map(ViewProfile::getId).collect(Collectors.toList());
        ids.forEach(viewProfileRepository::deleteById);
        log.info("Housekeeping " + check + ": deleted " + ids);
        return ids.size();
    }

    /**
     * Used last before the limit, except the most recently used of each consultant. Those without an owner are a
     * matter of the left-over check.
     */
    private List<ViewProfile> oldViewProfiles() {
        LocalDate limit = LocalDate.now().minusDays(oldAfter.toDays());
        Map<String, List<ViewProfile>> byOwner = StreamSupport.stream(viewProfileRepository.findAll().spliterator(), false)
                .filter(Objects::nonNull)
                .filter(viewProfile -> !isBlank(viewProfile.getViewProfileInfo().getOwnerInitials()))
                .collect(Collectors.groupingBy(viewProfile ->
                        viewProfile.getViewProfileInfo().getOwnerInitials().toLowerCase(Locale.ROOT)));
        return byOwner.values().stream()
                .flatMap(viewProfiles -> viewProfiles.stream()
                        .sorted(Comparator.comparing(OldViewProfilesService::lastUsed)
                                .thenComparing(ViewProfile::getId).reversed())
                        .skip(1))
                .filter(viewProfile -> lastUsed(viewProfile).isBefore(limit))
                .sorted(Comparator.comparing(OldViewProfilesService::lastUsed).thenComparing(ViewProfile::getId))
                .collect(Collectors.toList());
    }

    static LocalDate lastUsed(ViewProfile viewProfile) {
        ViewProfileInfo info = viewProfile.getViewProfileInfo();
        LocalDate used = info.getLastUsed() != null ? info.getLastUsed() : TRACKED_SINCE;
        return info.getCreationDate() != null && info.getCreationDate().isAfter(used) ? info.getCreationDate() : used;
    }

    private static String describe(ViewProfile viewProfile) {
        ViewProfileInfo info = viewProfile.getViewProfileInfo();
        return info.getOwnerInitials() + ": " + (isBlank(info.getName()) ? viewProfile.getId() : info.getName())
                + " (" + lastUsed(viewProfile) + ")";
    }
}
