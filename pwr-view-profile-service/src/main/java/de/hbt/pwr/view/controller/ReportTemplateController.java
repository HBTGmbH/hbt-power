package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.service.ReportTemplateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reads templates, for everyone who exports a profile. Uploading, changing and deleting them is admin-only
 * ({@link ReportTemplateAdminController}, #203)
 */
@Slf4j
@CrossOrigin
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

    @GetMapping
    public ResponseEntity<List<String>> getAllTemplates() {
        List<String> ids = reportTemplateService.getTemplateIds();
        return ResponseEntity.ok(ids);
    }

    @GetMapping("{id}")
    public ResponseEntity<ReportTemplate> getTemplate(@PathVariable String id) {
        return ResponseEntity.ok(reportTemplateService.getTemplate(id));
    }
}
