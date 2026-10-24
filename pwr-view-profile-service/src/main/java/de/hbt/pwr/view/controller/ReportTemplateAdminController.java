package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.UploadFileResponse;
import de.hbt.pwr.view.service.ReportTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Set;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

/**
 * Uploads, changes and deletes report templates. The edge lets only admins through to {@code /admin} (#203); the
 * creator is the account the edge puts into the header, never a value from the request.
 */
@CrossOrigin
@RequestMapping("/admin/template")
@Controller
public class ReportTemplateAdminController {

    static final String USER_LOGIN_HEADER = "X-Pwr-User-Login";

    private final ReportTemplateService reportTemplateService;

    private final FileUploadClient fileUploadClient;

    @Autowired
    public ReportTemplateAdminController(ReportTemplateService reportTemplateService,
                                         FileUploadClient fileUploadClient) {
        this.reportTemplateService = reportTemplateService;
        this.fileUploadClient = fileUploadClient;
    }

    /**
     * @param login missing locally without the edge
     */
    @PostMapping
    public ResponseEntity<ReportTemplate> uploadTemplate(@RequestParam("file") MultipartFile file,
                                                         @RequestParam("templateSlice") String templateString,
                                                         @RequestHeader(value = USER_LOGIN_HEADER, required = false) String login) {
        ReportTemplate newTemplate = new ReportTemplate();
        ReportTemplate.ReportTemplateSlice templateSlice =
                ReportTemplate.ReportTemplateSlice.fromJSON(templateString);
        ResponseEntity<UploadFileResponse> designFileResponseEntity =
                fileUploadClient.uploadFile(file);

        if (designFileResponseEntity.getStatusCode() == HttpStatus.OK) {
            UploadFileResponse designFileResponse = designFileResponseEntity.getBody();
            newTemplate.setName(templateSlice.name);
            newTemplate.setDescription(templateSlice.description);
            newTemplate.setCreatedDate(LocalDate.now());
            newTemplate.setFileId(designFileResponse.getFileId());
            newTemplate.setCreateUser(login != null ? login : "");
            // Previews are rendered live with the data of a view profile (ViewProfileController), none is stored
            newTemplate.setPreviewId("");
            ReportTemplate template = reportTemplateService.saveTemplate(newTemplate);
            return ResponseEntity.ok(template);
        } else {
            throw new RuntimeException(
                    "Could not store template - Status: " + designFileResponseEntity.getStatusCode()
                            .value());
        }

    }

    /**
     * The ids of the files and previews all templates point to; the housekeeping of the report service deletes the
     * other files (#242)
     */
    @GetMapping("files")
    public ResponseEntity<Set<String>> referencedFileIds() {
        return ResponseEntity.ok(reportTemplateService.getReferencedFileIds());
    }

    @DeleteMapping("{id}")
    public ResponseEntity deleteTemplate(@PathVariable String id) {
        ReportTemplate template = reportTemplateService.getTemplate(id);
        if (isNotBlank(template.getPreviewId())) {
            fileUploadClient.deleteFile(template.getPreviewId());
        }
        if (isNotBlank(template.getFileId())) {
            fileUploadClient.deleteFile(template.getFileId());
        }
        reportTemplateService.deleteTemplate(id);
        return ResponseEntity.ok("Success");
    }

    /**
     * Every blank field keeps its stored value; the creator and the creation date never change
     */
    @PostMapping("{id}")
    public ResponseEntity updateTemplate(@PathVariable("id") String id,
                                         @RequestBody ReportTemplate newTemplate) {

        ReportTemplate oldTemplate = reportTemplateService.getTemplate(id);

        newTemplate.setName(
                isNotBlank(newTemplate.getName()) ? newTemplate.getName() : oldTemplate.getName());
        newTemplate.setDescription(isNotBlank(newTemplate.getDescription()) ?
                newTemplate.getDescription() :
                oldTemplate.getDescription());
        newTemplate.setFileId(isNotBlank(newTemplate.getFileId()) ?
                newTemplate.getFileId() :
                oldTemplate.getFileId());
        newTemplate.setCreateUser(oldTemplate.getCreateUser());
        newTemplate.setCreatedDate(oldTemplate.getCreatedDate());
        newTemplate.setPreviewId(isNotBlank(newTemplate.getPreviewId()) ?
                newTemplate.getPreviewId() :
                oldTemplate.getPreviewId());

        ReportTemplate template = reportTemplateService.updateTemplate(id, newTemplate);
        return ResponseEntity.ok(template);
    }
}
