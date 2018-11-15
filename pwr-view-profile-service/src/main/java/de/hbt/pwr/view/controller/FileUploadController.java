package de.hbt.pwr.view.controller;


import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.service.FileSystemStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import java.io.IOException;
import java.util.stream.Collectors;

@RequestMapping("/upload")
@Controller
public class FileUploadController {
    private final FileSystemStorageService storageService;

    private final ReportTemplateController reportTemplateController;

    @Autowired
    public FileUploadController(FileSystemStorageService storageService,
                                ReportTemplateController reportTemplateController) {
        this.storageService = storageService;
        this.reportTemplateController = reportTemplateController;
    }


    //---------------
    // File Upload
    //---------------

    @GetMapping("/all")
    public ResponseEntity listUploadedFiles(Model model) throws IOException {
        model.addAttribute("files", storageService.loadAll().map(
                path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
                        "serveFile", path.getFileName().toString()).build().toString()).collect(Collectors.toList()));
        return ResponseEntity.ok(model);
    }

    @GetMapping("/files/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @PostMapping(path = "/post")
    public ResponseEntity uploadTemplate(@RequestParam("file") MultipartFile file, @RequestParam("templateSlice") String dataString) {
        storageService.store(file);

        ReportTemplate.ReportTemplateSlice templateSlice = ReportTemplate.ReportTemplateSlice.fromJSON(dataString);
        String getName = file.getName();
        String getOrignName = file.getOriginalFilename();

        String[] strArr = file.getOriginalFilename().split("\\.");
        // validate filetype
        switch (file.getOriginalFilename().split("\\.")[1]){
            case "rptdesign": {
                if(templateSlice != null || !templateSlice.name.equals("")){
                // create Template
                ReportTemplate.ReportTemplateShort templateShort = new ReportTemplate.ReportTemplateShort();
                templateShort.path = storageService.load(file.getOriginalFilename()).toString();
                templateShort.description = templateSlice.description;
                templateShort.createUser = "TODO";
                return ResponseEntity.ok(  "File uploaded!\n Template created! \n"+ reportTemplateController.createTemplate(templateSlice.name, templateShort));
            }}
        }
        return ResponseEntity.ok( "File uploaded!");
    }
}
