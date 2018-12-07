package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.model.UploadFileResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@CrossOrigin
@RequestMapping("/file")
@Controller
public class FileUploadController {

    private FileUploadClient fileUploadClient;

    @Autowired
    public FileUploadController(FileUploadClient fileUploadClient) {
        this.fileUploadClient = fileUploadClient;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> listUploadedFiles() throws IOException {
        return fileUploadClient.listUploadedFiles();

    }

    @GetMapping("{fileId}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String fileId) {
        return fileUploadClient.serveFile(fileId);
    }

    @PostMapping
    public ResponseEntity<UploadFileResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        return fileUploadClient.uploadFile(file);

    }
}
