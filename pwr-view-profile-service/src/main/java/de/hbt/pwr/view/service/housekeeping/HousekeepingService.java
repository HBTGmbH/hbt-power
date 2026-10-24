package de.hbt.pwr.view.service.housekeeping;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.model.HousekeepingFindings;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * Housekeeping of the data of the view-profile service (#242): view profiles of consultants that are gone and
 * templates whose file the report service no longer has. What it needs to know from other services it asks them; it
 * deletes only its own data. If another service does not answer, the check reports that instead of findings, so an
 * empty answer never turns every view profile into a left-over.
 */
@Slf4j
@Service
public class HousekeepingService {

    public static final String VIEW_PROFILES_WITHOUT_CONSULTANT = "view-profiles-without-consultant";
    public static final String TEMPLATES_WITHOUT_FILE = "templates-without-file";

    private final ViewProfileRepository viewProfileRepository;
    private final ReportTemplateRepository reportTemplateRepository;
    private final ProfileServiceClient profileServiceClient;
    private final FileUploadClient fileUploadClient;

    public HousekeepingService(ViewProfileRepository viewProfileRepository,
                               ReportTemplateRepository reportTemplateRepository,
                               ProfileServiceClient profileServiceClient, FileUploadClient fileUploadClient) {
        this.viewProfileRepository = viewProfileRepository;
        this.reportTemplateRepository = reportTemplateRepository;
        this.profileServiceClient = profileServiceClient;
        this.fileUploadClient = fileUploadClient;
    }

    public List<HousekeepingFindings> check() {
        return List.of(
                findings(VIEW_PROFILES_WITHOUT_CONSULTANT, () -> viewProfilesWithoutConsultant().stream()
                        .map(HousekeepingService::describe).collect(Collectors.toList())),
                findings(TEMPLATES_WITHOUT_FILE, () -> templatesWithoutFile().stream()
                        .map(template -> template.getName() + " (" + template.getId() + ")").collect(Collectors.toList()))
        );
    }

    /**
     * Deletes what the check finds right now; returns how many
     */
    public int clean(String check) {
        try {
            List<String> ids;
            switch (check) {
                case VIEW_PROFILES_WITHOUT_CONSULTANT:
                    ids = viewProfilesWithoutConsultant().stream().map(ViewProfile::getId).collect(Collectors.toList());
                    ids.forEach(viewProfileRepository::deleteById);
                    break;
                case TEMPLATES_WITHOUT_FILE:
                    ids = templatesWithoutFile().stream().map(ReportTemplate::getId).collect(Collectors.toList());
                    ids.forEach(reportTemplateRepository::deleteById);
                    break;
                default:
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No housekeeping check " + check);
            }
            log.info("Housekeeping " + check + ": deleted " + ids);
            return ids.size();
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, unavailable(e));
        }
    }

    private static HousekeepingFindings findings(String check, Supplier<List<String>> findings) {
        try {
            return HousekeepingFindings.of(check, findings.get());
        } catch (RestClientException e) {
            return HousekeepingFindings.failed(check, unavailable(e));
        }
    }

    private static String unavailable(RestClientException e) {
        return "Another service did not answer: " + e.getMessage();
    }

    private static String describe(ViewProfile viewProfile) {
        String owner = viewProfile.getViewProfileInfo().getOwnerInitials();
        String name = viewProfile.getViewProfileInfo().getName();
        return (isBlank(owner) ? "?" : owner) + ": " + (isBlank(name) ? viewProfile.getId() : name)
                + (viewProfile.getViewProfileInfo().getCreationDate() != null
                ? " (" + viewProfile.getViewProfileInfo().getCreationDate() + ")" : "");
    }

    /** Also those without an owner: nobody can open them */
    private List<ViewProfile> viewProfilesWithoutConsultant() {
        Set<String> initials = profileServiceClient.findAllInitials();
        if (initials.isEmpty()) {
            // Never all view profiles because of an empty answer
            throw new RestClientException("the profile service knows no consultant");
        }
        return StreamSupport.stream(viewProfileRepository.findAll().spliterator(), false)
                .filter(viewProfile -> !initials.contains(viewProfile.getViewProfileInfo().getOwnerInitials()))
                .collect(Collectors.toList());
    }

    /** The design file is gone (or was never stored); a missing preview doesn't matter, previews are rendered live */
    private List<ReportTemplate> templatesWithoutFile() {
        Set<String> files = fileUploadClient.findAllFileIds();
        return StreamSupport.stream(reportTemplateRepository.findAll().spliterator(), false)
                .filter(template -> isBlank(template.getFileId()) || !files.contains(template.getFileId()))
                .collect(Collectors.toList());
    }
}
