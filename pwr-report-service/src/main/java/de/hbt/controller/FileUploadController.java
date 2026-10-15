package de.hbt.controller;


import de.hbt.model.files.DBFile;
import de.hbt.model.files.UploadFileResponse;
import de.hbt.service.DBFileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

// TODO Swagger annotations + swagger ui
@RequestMapping("file")
@RestController
public class FileUploadController {


    private DBFileStorageService dbFileStorageService;

    @Autowired
    public FileUploadController(DBFileStorageService dbFileStorageService) {
        this.dbFileStorageService = dbFileStorageService;
    }

    @PostMapping
    public UploadFileResponse uploadFile(@RequestParam("file") MultipartFile file) {
        DBFile dbFile = dbFileStorageService.storeFile(file);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("file/" + dbFile.getId())
                .toUriString();

        return new UploadFileResponse(dbFile.getId(), dbFile.getFilename(), fileDownloadUri, file.getContentType(), file.getSize());

    }

    @GetMapping("{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileId) {
        DBFile dbFile = dbFileStorageService.getFile(fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(dbFile.getFiletype()))
                .body(new ByteArrayResource(dbFile.getData()));
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> allFiles() {
        return ResponseEntity.ok(dbFileStorageService.allFiles());
    }

    @DeleteMapping("{fileId}")
    public ResponseEntity deleteFile(@PathVariable String fileId){
        DBFile dbFile = dbFileStorageService.getFile(fileId);
        if ( dbFile != null){
            dbFileStorageService.deleteFile(fileId);
        }

        return ResponseEntity.ok().build();
    }
}