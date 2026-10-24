package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.client.report.model.ReportInfo;
import de.hbt.pwr.view.exception.ServiceError;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.service.ReportTemplateService;
import de.hbt.pwr.view.service.ViewProfileCreatorService;
import de.hbt.pwr.view.service.ViewProfileMergeService;
import de.hbt.pwr.view.service.ViewProfileOperationService;
import io.swagger.annotations.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.net.URI;
import java.util.List;

import static java.util.Optional.ofNullable;

/**
 * <strong>For documentation, launch the service and go to <a href="http://localhost:9008/swagger-ui.html"> the
 * swagger UI documentation</a></strong> <em>(actual port may differ)</em>
 * <p>
 * Contains 'elemental' operations for {@link ViewProfile}, create, read and delete. Updates are performed as partial
 * updates in the {@link ViewProfileOperationsController}
 * </p>
 * <p>
 * <strong>A note on security</strong>: View profiles are only accessible with the right combination of ID and initials. If the
 * {@link ViewProfile} with the given ID does not have the correct owner, an operation will fail. This itself
 * is only pseudo-security, as the initials may be changed at will. In later development stages, a security concept
 * based around the edge server may be implemented such that users will only ever be able to access their own
 * spaces of the services.
 * <br/>
 * <br/>
 * Example: User 'tst' can only access <code>/api/tst/**</code>, but not <code>/api/xyz/**</code>,
 * as the <code>/api/xyz/**</code> endpoints are protected by the security framework.
 * <br/>
 * <br/>
 * This is why this service checks the owner initials with the initials provided in the request.
 * </p>
 *
 * @author nt (nt@hbt.de)
 * @see <a href="http://localhost:9008/swagger-ui.html">Swagger UI doc</a>
 */
@Api(value = "/view", description = "Creates, reads and deletes view profiles")
@RequestMapping("/view")
@Controller
@CrossOrigin
public class ViewProfileController {

    private static final Logger LOG = LogManager.getLogger(ViewProfile.class);

    /**
     * Who is logged in, set by the edge from the verified token
     */
    static final String USER_LOGIN_HEADER = "X-Pwr-User-Login";
    static final String USER_INITIALS_HEADER = "X-Pwr-User-Initials";


    // private final ViewProfileImporter viewProfileImporter;

    private final ViewProfileOperationService viewProfileService;

    private final ReportTemplateService reportTemplateService;

    private final ReportServiceClient reportServiceClient;

    private final ViewProfileMergeService viewProfileMergeService;

    private final ViewProfileCreatorService viewProfileCreatorService;

    //private static final Logger LOG = Logger.getLogger(ViewProfileController.class);

    @Autowired
    public ViewProfileController(ViewProfileOperationService viewProfileService,
                                 ReportServiceClient reportServiceClient, ReportTemplateService reportTemplateService,
                                 ViewProfileMergeService viewProfileMergeService,
                                 ViewProfileCreatorService viewProfileCreatorService) {
        this.viewProfileService = viewProfileService;
        this.reportServiceClient = reportServiceClient;
        this.reportTemplateService = reportTemplateService;
        this.viewProfileMergeService = viewProfileMergeService;
        this.viewProfileCreatorService = viewProfileCreatorService;
    }

    @ApiOperation(value = "Creates a view profile for the given consultant", notes =
            "A consultant is always represented by their unique initials. The created view profile is based around the"
                    + " current base data that are available.", response = ViewProfile.class, httpMethod = "POST", produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Returns the newly created view profile in the response", response = ViewProfile.class),
            @ApiResponse(code = 400, message = "Could not retrieve profile for given initials", response = ServiceError.class)})
    @PostMapping(path = "/{initials}")
    public ResponseEntity<ViewProfile> createViewProfile(
            @ApiParam("Initials of the consultant for which the profile is created")
            @PathVariable("initials") String initials,
            @RequestBody ViewProfile.ViewProfileStub data,
            @RequestParam(value = "locale", required = false) String locale) {
        if (locale == null) {
            locale = ViewProfileCreatorService.DEFAULT_LOCALE;
        }
        ViewProfile viewProfile = viewProfileCreatorService
                .createViewProfile(initials, data.name, data.viewDescription, locale, data.localization);
        return ResponseEntity.ok(viewProfile);
    }

    @PostMapping("/update/{initials}/{oldId}")
    public ResponseEntity<ViewProfile> updateViewProfile(@PathVariable("initials") String initials,
                                                         @PathVariable("oldId") String oldId,
                                                         @RequestBody ViewProfile.ViewProfileMergeOptions options) {

        ViewProfile newVP = viewProfileMergeService.updateViewProfile(oldId, initials, options);
        return ResponseEntity.ok(newVP);
    }

    @GetMapping(path = "/{initials}")
    public ResponseEntity<List<String>> getAllViewProfiles(
            @PathVariable("initials") String initials) {
        List<String> ids = viewProfileService.getViewProfileIdsForInitials(initials);
        return ResponseEntity.ok(ids);
    }

    @ApiOperation(value = "Returns a specified view profile.", notes = "Returns the view profile with the given ID as long as it belongs to the consultant with the provided initials", response = String.class, responseContainer = "List", httpMethod = "GET", produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "View profile is returned in response."),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)})
    @GetMapping(path = "/{initials}/{id}")
    public ResponseEntity<ViewProfile> getViewProfile(@PathVariable("initials") String initials,
                                                      @PathVariable String id) {
        ViewProfile profile = viewProfileService.getByIdAndCheckOwner(id, initials);
        return ResponseEntity.ok(profile);
    }

    @ApiOperation(value = "Deletes the specified view profile", notes = "Deletes the specified view profile of the specified consultant.", httpMethod = "DELETE")
    @ApiResponses(value = {
            @ApiResponse(code = 204, message = "The view profile has been deleted."),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)})
    @DeleteMapping(path = "/{initials}/{id}")
    public ResponseEntity deleteViewProfile(@PathVariable("initials") String initials,
                                            @PathVariable String id) {
        viewProfileService.deleteWithOwnerCheck(id, initials);
        return ResponseEntity.noContent().build();
    }


    @PatchMapping(path = "/{initials}/view/{viewProfileId}/info")
    public ResponseEntity<ViewProfile> partiallyUpdateInfo(
            @RequestBody ViewProfileInfo viewProfileInfo, @PathVariable("initials") String initials,
            @PathVariable("viewProfileId") String viewProfileId) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.updateInfo(viewProfile, viewProfileInfo);
        return ResponseEntity.ok(viewProfile);
    }

    //---------------
    // Report
    //---------------
    @PostMapping(path = "/{initials}/view/{viewProfileId}/{templateId}/report")
    public ResponseEntity<String> generateReport(@PathVariable("initials") String initials,
                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                 @PathVariable("templateId") String templateId,
                                                 @RequestHeader(value = USER_LOGIN_HEADER, required = false) String login,
                                                 @RequestHeader(value = USER_INITIALS_HEADER, required = false) String userInitials) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        ReportTemplate template =
                (templateId.equals("-1") ? null : reportTemplateService.getTemplate(templateId));
        // Who exports only from the headers of the edge, never from the request (#214)
        ResponseEntity<String> response = reportServiceClient.generateReport(reportInfo(initials, viewProfile, template), "DOC",
                login, userInitials);
        URI location =
                ofNullable(response).map(HttpEntity::getHeaders).map(HttpHeaders::getLocation)
                        .orElse(URI.create(""));
        return ResponseEntity.created(location).body(location.toString());
    }

    /**
     * The report as PDF, rendered live with the data of the view profile, the same way as {@link #generateReport}.
     * Nothing is stored. 422 with the reason as text if the template cannot be rendered with this data.
     */
    @ApiOperation(value = "Renders a preview of the report as PDF",
            notes = "Same data as the generated report, but rendered as PDF and not stored in the report history.")
    @GetMapping(path = "/{initials}/view/{viewProfileId}/{templateId}/preview")
    public ResponseEntity<byte[]> previewReport(@PathVariable("initials") String initials,
                                                @PathVariable("viewProfileId") String viewProfileId,
                                                @PathVariable("templateId") String templateId) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        ReportTemplate template = reportTemplateService.getTemplate(templateId);
        try {
            byte[] pdf = reportServiceClient.renderPdfPreview(reportInfo(initials, viewProfile, template));
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .cacheControl(CacheControl.noStore())
                    .body(pdf);
        } catch (HttpClientErrorException.UnprocessableEntity e) {
            return ResponseEntity.unprocessableEntity()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(e.getResponseBodyAsByteArray());
        }
    }

    private static ReportInfo reportInfo(String initials, ViewProfile viewProfile, ReportTemplate template) {
        return ReportInfo.builder().viewProfile(viewProfile).initials(initials)
                .name(viewProfile.getViewProfileInfo().getConsultantName())
                .birthDate(viewProfile.getViewProfileInfo().getConsultantBirthDate())
                .reportTemplate(template).build();
    }
}
