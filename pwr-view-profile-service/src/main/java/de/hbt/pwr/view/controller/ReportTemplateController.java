package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.service.ReportTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RequestMapping("/template")
@Controller
public class ReportTemplateController {

    private final ReportTemplateService reportTemplateService;

    @Autowired
    public ReportTemplateController(ReportTemplateService reportTemplateService) {
        this.reportTemplateService = reportTemplateService;
    }


    //---------------
    // Templates
    //---------------

    @GetMapping(path = "")
    public ResponseEntity<List<String>> getAllTemplates() {
        List<String> ids = reportTemplateService.getTemplateIds();
        return ResponseEntity.ok(ids);
    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<ReportTemplate> getTemplate(@PathVariable String id) {
        return ResponseEntity.ok(reportTemplateService.getTemplate(id));
    }

    @PostMapping(path = "/{name}")
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
        reportTemplate.setPreviewUrl("");//path );
        ReportTemplate template = reportTemplateService.saveTemplate(reportTemplate);

        return ResponseEntity.ok(template);
    }


    @DeleteMapping(path = "/{id}")
    public ResponseEntity deleteTemplate(@PathVariable String id) {
        reportTemplateService.deleteTemplate(id);
        return ResponseEntity.ok("Success");
    }


    @PatchMapping(path = "/{id}")
    public ResponseEntity updateTemplate(
            @PathVariable("id") String id,
            @RequestBody ReportTemplate.ReportTemplateSlice templateSlice) {

        ReportTemplate newTemplate = new ReportTemplate();
        newTemplate.setId(id);
        newTemplate.setName(templateSlice.name);
        newTemplate.setDescription(templateSlice.description);
        //newTemplate.setPath(templateSlice.path); TODO
        newTemplate.setCreateUser(reportTemplateService.getTemplate(id).getCreateUser());
        newTemplate.setCreatedDate(reportTemplateService.getTemplate(id).getCreatedDate());
       // newTemplate.setPreviewUrl((templateSlice.path.equals(reportTemplateService.getTemplate(id).getPath())) ? reportTemplateService.getTemplate(id).getPreviewUrl() : "TODO render html");

        ReportTemplate template = reportTemplateService.updateTemplate(id, newTemplate);
        return ResponseEntity.ok(template);
    }

    //---------------
    // Preview
    //---------------

    @GetMapping(path = "/preview/{id}")
    public ResponseEntity<String> getPreview(@PathVariable String id) {
        return ResponseEntity.ok(reportTemplateService.getPreviewURL(id));
    }


    @GetMapping(path = "preview/all")
    public ResponseEntity<List<String>> getAllPreviews() {
        return ResponseEntity.ok(reportTemplateService.getAllPreviewURL());
    }
}
