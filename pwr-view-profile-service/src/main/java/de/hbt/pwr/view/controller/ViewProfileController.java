package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.client.report.model.ReportInfo;
import de.hbt.pwr.view.exception.ServiceError;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.service.ReportTemplateService;
import de.hbt.pwr.view.service.StorageService;
import de.hbt.pwr.view.service.ViewProfileImporter;
import de.hbt.pwr.view.service.ViewProfileService;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Optional.ofNullable;

/**
 * <strong>For documentation, launch the service and go to <a href="http://localhost:9008/swagger-ui.html"> the
 * swagger UI documentation</a></strong> <em>(actual port may differ)</em>
 * <p>
 *     Contains 'elemental' operations for {@link ViewProfile}, create, read and delete. Updates are performed as partial
 *     updates in the {@link ViewProfileOperationsController}
 * </p>
 * <p>
 *     <strong>A note on security</strong>: View profiles are only accessible with the right combination of ID and initials. If the
 *     {@link ViewProfile} with the given ID does not have the correct owner, an operation will fail. This itself
 *     is only pseudo-security, as the initials may be changed at will. In later development stages, a security concept
 *     based around the edge server may be implemented such that users will only ever be able to access their own
 *     spaces of the services.
 *     <br/>
 *     <br/>
 *     Example: User 'tst' can only access <code>/api/tst/**</code>, but not <code>/api/xyz/**</code>,
 *     as the <code>/api/xyz/**</code> endpoints are protected by the security framework.
 *     <br/>
 *     <br/>
 *     This is why this service checks the owner initials with the initials provided in the request.
 * </p>
 * @see  <a href="http://localhost:9008/swagger-ui.html">Swagger UI doc</a>
 * @author nt (nt@hbt.de)
 */
@Api(value = "/view", description = "Creates, reads and deletes view profiles")
@RequestMapping("/view")
@Controller
public class ViewProfileController {

    private final ViewProfileImporter viewProfileImporter;

    private final ViewProfileService viewProfileService;

    private final ReportTemplateService reportTemplateService;

    private final ReportServiceClient reportServiceClient;

    private final StorageService storageService;

    //private static final Logger LOG = Logger.getLogger(ViewProfileController.class);

    @Autowired
    public ViewProfileController(ViewProfileImporter viewProfileImporter
                                , ViewProfileService viewProfileService
                                , ReportServiceClient reportServiceClient
                                ,ReportTemplateService reportTemplateService
                                ,StorageService storageService
                                 ) {
        this.viewProfileImporter = viewProfileImporter;
        this.viewProfileService = viewProfileService;
        this.reportServiceClient = reportServiceClient;
        this.reportTemplateService = reportTemplateService;
        this.storageService = storageService;
    }

    @ApiOperation(value = "Creates a view profile for the given consultant",
        notes = "A consultant is always represented by their unique initials. The created view profile is based around the" +
                " current base data that are available.",
        response = ViewProfile.class,
        httpMethod = "POST",
        produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "Returns the newly created view profile in the response", response = ViewProfile.class),
            @ApiResponse(code = 400, message = "Could not retrieve profile for given initials", response = ServiceError.class)
    })
    @PostMapping(path = "/{initials}")
    public ResponseEntity<ViewProfile> createViewProfile(
            @ApiParam("Initials of the consultant for which the profile is created") @PathVariable("initials") String initials,
            @RequestBody ViewProfile.ViewProfileStub data,
            @RequestParam(value = "locale", required = false) String locale) {
        if(locale == null) {
            locale = ViewProfileImporter.DEFAULT_LOCALE;
        }
        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials, data.name, data.viewDescription, locale);
        return ResponseEntity.ok(viewProfile);
    }


    @GetMapping(path = "/{initials}")
    public ResponseEntity< List<String>> getAllViewProfiles(@PathVariable("initials") String initials) {
        List<String> ids = viewProfileService.getViewProfileIdsForInitials(initials);
        return ResponseEntity.ok(ids);
    }



    @ApiOperation(
            value = "Returns a specified view profile.",
            notes = "Returns the view profile with the given ID as long as it belongs to the consultant with the provided initials",
            response = String.class,
            responseContainer = "List",
            httpMethod = "GET",
            produces = "application/json"
    )
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "View profile is returned in response."),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @GetMapping(path = "/{initials}/{id}")
    public ResponseEntity<ViewProfile> getViewProfile(@PathVariable("initials") String initials, @PathVariable String id) {
        ViewProfile profile = viewProfileService.getByIdAndCheckOwner(id, initials);
        return ResponseEntity.ok(profile);
    }

    @ApiOperation(
            value = "Deletes the specified view profile",
            notes = "Deletes the specified view profile of the specified consultant.",
            httpMethod = "DELETE"
    )
    @ApiResponses(value ={
            @ApiResponse(code = 204, message = "The view profile has been deleted."),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @DeleteMapping(path = "/{initials}/{id}")
    public ResponseEntity deleteViewProfile(@PathVariable("initials") String initials, @PathVariable String id) {
        viewProfileService.deleteWithOwnerCheck(id, initials);
        return ResponseEntity.noContent().build();
    }

    //---------------
    // Templates
    //---------------

    @GetMapping(path = "/template")
    public ResponseEntity<List<String>> getAllTemplates(){
        List<String> ids = reportTemplateService.getTemplateIds();
        return ResponseEntity.ok(ids);
    }

    @GetMapping(path = "/template/{id}")
    public ResponseEntity<ReportTemplate> getTemplate(@PathVariable String id){
        return ResponseEntity.ok(reportTemplateService.getTemplate(id));
    }

    @PostMapping(path = "/template/{name}")
    public ResponseEntity<ReportTemplate> createTemplate(
            @PathVariable("name") String name,
            @RequestBody ReportTemplate.ReportTemplateShort data) {

        ReportTemplate reportTemplate = new ReportTemplate();
        reportTemplate.setName(name);
        reportTemplate.setDescription(data.description);
        reportTemplate.setPath(data.path);
        reportTemplate.setCreateUser(data.createUser);
        reportTemplate.setCreatedDate(LocalDate.now());
        // TODO anhand des pfades eine html datei rendern und auf dem Server speichern und dann den link dazu speichern
        //ResponseEntity<String> resp = reportServiceClient.generateHtml(data.path); // TODO wieder hinzufügen
        //String path = resp.toString();
        reportTemplate.setPreviewUrl("/usr/share/power2/report/previews/export_2018_11_06_13_47_49.html");//path );
        ReportTemplate template = reportTemplateService.saveTemplate(reportTemplate);

        return ResponseEntity.ok(template);
    }


    @DeleteMapping(path = "/template/{id}")
    public ResponseEntity deleteTemplate(@PathVariable String id){
        reportTemplateService.deleteTemplate(id);
        return ResponseEntity.ok("Success");
    }


    @PatchMapping(path = "/template/{id}")
    public ResponseEntity updateTemplate(
            @PathVariable("id") String id,
            @RequestBody ReportTemplate.ReportTemplateSlice templateSlice) {

        ReportTemplate newTemplate = new ReportTemplate();
        newTemplate.setId(id);
        newTemplate.setName(templateSlice.name);
        newTemplate.setDescription(templateSlice.description);
        newTemplate.setPath(templateSlice.path);
        newTemplate.setCreateUser(reportTemplateService.getTemplate(id).getCreateUser());
        newTemplate.setCreatedDate(reportTemplateService.getTemplate(id).getCreatedDate());
        newTemplate.setPreviewUrl((templateSlice.path.equals(reportTemplateService.getTemplate(id).getPath()))? reportTemplateService.getTemplate(id).getPreviewUrl(): "TODO render html");

        ReportTemplate template = reportTemplateService.updateTemplate(id, newTemplate);
        return ResponseEntity.ok(template);
    }

    //---------------
    // Preview
    //---------------

    @GetMapping(path = "/template/preview/{id}")
    public ResponseEntity<String> getPreview(@PathVariable String id){
        return ResponseEntity.ok(reportTemplateService.getPreviewURL(id));
    }


    @GetMapping(path ="/template/preview/all")
    public ResponseEntity<List<String>> getAllPreviews(){
        return ResponseEntity.ok(reportTemplateService.getAllPreviewURL());
    }


    //---------------
    // File Upload
    //---------------
    @GetMapping("/")
    public String listUploadedFiles(Model model) throws IOException {
        model.addAttribute("files", storageService.loadAll().map(
                path -> MvcUriComponentsBuilder.fromMethodName(ViewProfileController.class,
                        "serveFile", path.getFileName().toString()).build().toString()).collect(Collectors.toList()));
        return "uploadForm";
    }

    @GetMapping("/files/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename){
        Resource file = storageService.loadAsResource(filename);

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @PostMapping(path = "/template/upload/")
    public String uploadTemplate(@RequestParam("file")MultipartFile file, RedirectAttributes redirectAttributes){
        storageService.store(file);
        redirectAttributes.addFlashAttribute("message", "You sucessfully uploaded " +file.getOriginalFilename());
        return "redirect:/";
    }
    //---------------
    // Report
    //---------------
    @PostMapping(path = "/{initials}/view/{viewProfileId}/{templateId}/report")
    public ResponseEntity<String> generateReport(@PathVariable("initials") String initials,
                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                 @PathVariable("templateId") String templateId) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        ReportTemplate template = (templateId.equals("-1") ? null : reportTemplateService.getTemplate(templateId));
        ReportInfo reportInfo = ReportInfo.builder()
                .viewProfile(viewProfile)
                .initials(initials)
                .name(viewProfile.getViewProfileInfo().getConsultantName())
                .birthDate(viewProfile.getViewProfileInfo().getConsultantBirthDate())
                .reportTemplate(template).build();
        ResponseEntity<String> response = reportServiceClient.generateReport(reportInfo, "DOC", viewProfile.getViewProfileInfo().getCharsPerLine());
        URI location = ofNullable(response)
                .map(HttpEntity::getHeaders)
                .map(HttpHeaders::getLocation)
                .orElse(URI.create(""));
        return ResponseEntity.created(location).body(location.toString());
    }

    @PatchMapping(path = "/{initials}/view/{viewProfileId}/info")
    public ResponseEntity<ViewProfile> partiallyUpdateInfo(@RequestBody ViewProfileInfo viewProfileInfo,
                                                           @PathVariable("initials") String initials,
                                                           @PathVariable("viewProfileId") String viewProfileId) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.updateInfo(viewProfile, viewProfileInfo);
        return ResponseEntity.ok(viewProfile);
    }



}
