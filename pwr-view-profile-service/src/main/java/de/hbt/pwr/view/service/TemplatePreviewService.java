package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.UploadFileResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

/**
 * Previews (PDF with sample data) of report templates. A template without one gets it on first request.
 */
@Slf4j
@Service
public class TemplatePreviewService {

    private final ReportTemplateService reportTemplateService;
    private final ReportServiceClient reportServiceClient;

    /**
     * Templates whose preview could not be rendered (e.g. an element higher than the page, which the report service
     * cancels after a time limit). Not tried again until the template changes or the service restarts.
     */
    private final Set<String> failedTemplateIds = ConcurrentHashMap.newKeySet();

    public TemplatePreviewService(ReportTemplateService reportTemplateService, ReportServiceClient reportServiceClient) {
        this.reportTemplateService = reportTemplateService;
        this.reportServiceClient = reportServiceClient;
    }

    /**
     * @return id of the preview file, empty if the template has none and none can be rendered
     */
    // One rendering at a time: two requests for the same template must not render it twice
    public synchronized Optional<String> previewFileId(String templateId) {
        ReportTemplate template = reportTemplateService.getTemplate(templateId);
        if (isNotBlank(template.getPreviewId())) {
            return Optional.of(template.getPreviewId());
        }
        if (failedTemplateIds.contains(templateId) || isBlank(template.getFileId())) {
            return Optional.empty();
        }
        try {
            UploadFileResponse preview = reportServiceClient.generatePdfPreview(template.getFileId());
            template.setPreviewId(preview.getFileId());
            reportTemplateService.updateTemplate(templateId, template);
            log.info("Created preview {} for template {}", preview.getFileId(), templateId);
            return Optional.of(preview.getFileId());
        } catch (RestClientException e) {
            log.warn("Could not create a preview for template {}", templateId, e);
            failedTemplateIds.add(templateId);
            return Optional.empty();
        }
    }

    /**
     * The template changed: a preview that failed before may work now.
     */
    public void templateChanged(String templateId) {
        failedTemplateIds.remove(templateId);
    }
}
