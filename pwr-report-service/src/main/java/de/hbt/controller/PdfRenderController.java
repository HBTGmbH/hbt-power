package de.hbt.controller;

import de.hbt.model.files.UploadFileResponse;
import de.hbt.service.DBFileStorageService;
import de.hbt.service.ProfileReportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Slf4j
@RestController
@RequestMapping("pdf")
public class PdfRenderController {
    private final ProfileReportService profileReportService;

    private final DBFileStorageService storageService;

    @Autowired
    public PdfRenderController(ProfileReportService profileReportService,
                               DBFileStorageService storageService) {
        this.profileReportService = profileReportService;
        this.storageService = storageService;
    }

    @GetMapping("{fileId}")
    public ResponseEntity<UploadFileResponse> renderPdf(@PathVariable("fileId") String fileId) {
        try {
            log.debug("start render PDF");
            String responseId = profileReportService.generatePDFFile(fileId);
            log.debug("finished render PDF");

            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("file/" + storageService.getFile(responseId).getId()).toUriString();

            UploadFileResponse uploadFileResponse = new UploadFileResponse(responseId,
                    storageService.getFile(responseId).getFilename(), fileDownloadUri,
                    storageService.getFile(responseId).getFiletype(),
                    storageService.getFile(responseId).getData().length);

            return ResponseEntity.ok(uploadFileResponse);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new UploadFileResponse(fileId, e.toString(), "", "", 0));
        }
    }
}
