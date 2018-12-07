package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.UploadFileResponse;
import de.hbt.pwr.view.service.ReportTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin
@RequestMapping("/template")
@Controller
public class ReportTemplateController {

    private final ReportTemplateService reportTemplateService;

    private FileUploadClient fileUploadClient;

    private ReportServiceClient reportServiceClient;

    @Autowired
    public ReportTemplateController(ReportTemplateService reportTemplateService,
                                    FileUploadClient fileUploadClient,
                                    ReportServiceClient reportServiceClient) {
        this.reportTemplateService = reportTemplateService;
        this.fileUploadClient = fileUploadClient;
        this.reportServiceClient = reportServiceClient;
    }


    //---------------
    // Templates
    //---------------

    @GetMapping
    public ResponseEntity<List<String>> getAllTemplates() {
        List<String> ids = reportTemplateService.getTemplateIds();
        return ResponseEntity.ok(ids);
    }

    @GetMapping("{id}")
    public ResponseEntity<ReportTemplate> getTemplate(@PathVariable String id) {
        return ResponseEntity.ok(reportTemplateService.getTemplate(id));
    }

    @PostMapping
    public ResponseEntity<String> uploadTemplate(@RequestParam("file") MultipartFile file, @RequestParam("templateSlice") String templateString) {

        ReportTemplate newTemplate = new ReportTemplate();
        ReportTemplate.ReportTemplateSlice templateSlice = ReportTemplate.ReportTemplateSlice.fromJSON(templateString);

        UploadFileResponse designFileResponse = fileUploadClient.uploadFile(file).getBody();
        UploadFileResponse previewFileResponse = reportServiceClient.generateHtml(designFileResponse.getFileId()).getBody();

        if (!designFileResponse.getFileId().equals("")) {
            newTemplate.setName(templateSlice.name);
            newTemplate.setDescription(templateSlice.description);
            newTemplate.setCreatedDate(LocalDate.now());
            newTemplate.setFileId(designFileResponse.getFileId());
            newTemplate.setCreateUser(templateSlice.createUser);
            newTemplate.setPreviewId(previewFileResponse.getFileId());

            ReportTemplate template = reportTemplateService.saveTemplate(newTemplate);

            return ResponseEntity.ok(template.toString());
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping("{id}")
    public ResponseEntity deleteTemplate(@PathVariable String id) {
        reportTemplateService.deleteTemplate(id);
        return ResponseEntity.ok("Success");
    }


    @PatchMapping("{id}")
    public ResponseEntity updateTemplate(
            @PathVariable("id") String id,
            @RequestBody ReportTemplate.ReportTemplateSlice templateSlice) {

        ReportTemplate newTemplate = new ReportTemplate();
        newTemplate.setId(id);
        newTemplate.setName(templateSlice.name);
        newTemplate.setDescription(templateSlice.description);
        //newTemplate.setFileId(templateSlice.fileId); TODO
        newTemplate.setCreateUser(reportTemplateService.getTemplate(id).getCreateUser());
        newTemplate.setCreatedDate(reportTemplateService.getTemplate(id).getCreatedDate());
        // newTemplate.setPreviewId((templateSlice.fileId.equals(reportTemplateService.getTemplate(id).getFileId())) ? reportTemplateService.getTemplate(id).getPreviewId() : "TODO render html");

        ReportTemplate template = reportTemplateService.updateTemplate(id, newTemplate);
        return ResponseEntity.ok(template);
    }

    //---------------
    // Preview
    //---------------

    @GetMapping("preview/{id}")
    public ResponseEntity<Resource> getPreview(@PathVariable String id) {
        ReportTemplate template = reportTemplateService.getTemplate(id);
        if (template != null) {
            String filename = template.getPreviewId();
            if (filename != null && !filename.equals("")) {
                ResponseEntity<Resource> res = fileUploadClient.serveFile(filename);
                return res;
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("preview")
    public ResponseEntity<List<String>> getAllPreviews() {
        return ResponseEntity.ok(reportTemplateService.getAllPreviewFilenames());
    }

    @GetMapping("preview/ids")
    public ResponseEntity<List<String>> getAllPreviewTemplateIds() {
        return ResponseEntity.ok(reportTemplateService.getAllPreviewTemplateIds());
    }
}
