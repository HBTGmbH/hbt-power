package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@RequestMapping("/upload")
@Controller
public class FileUploadController {
    
    private FileUploadClient fileUploadClient;
    private ReportTemplateRepository reportTemplateRepository;
    
    @Autowired
    public FileUploadController(FileUploadClient fileUploadClient,
                                ReportTemplateRepository reportTemplateRepository){
        this.fileUploadClient = fileUploadClient;
        this.reportTemplateRepository = reportTemplateRepository;
    }

    @GetMapping("/all")
    public ResponseEntity listUploadedFiles(Model model) throws IOException {

        return ResponseEntity.ok(model);
    }

    @GetMapping("/files/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        return fileUploadClient.serveFile(filename);
    }

    @PostMapping(path = "/post")
    public ResponseEntity<String> uploadTemplate(@RequestParam("file") MultipartFile file, @RequestParam("templateSlice")String templateString) {
        ReportTemplate newTemplate = new ReportTemplate();
        ReportTemplate.ReportTemplateSlice templateSlice = ReportTemplate.ReportTemplateSlice.fromJSON(templateString);

        ResponseEntity<String> path = fileUploadClient.uploadFile(file);

        newTemplate.setName(templateSlice.name);
        newTemplate.setDescription(templateSlice.description);
        newTemplate.setCreatedDate(LocalDate.now());
        newTemplate.setPath(path.toString());
        newTemplate.setCreateUser(templateSlice.createUser);// TODO
        newTemplate.setPreviewUrl("");// TODO

        ReportTemplate template = reportTemplateRepository.save(newTemplate);

        return ResponseEntity.ok(template.toString());
    }
}
