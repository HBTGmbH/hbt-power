package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.UploadFileResponse;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpServerErrorException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class TemplatePreviewServiceTest {

    private ReportTemplateService reportTemplateService;
    private ReportServiceClient reportServiceClient;
    private TemplatePreviewService templatePreviewService;

    @Before
    public void setUp() {
        reportTemplateService = mock(ReportTemplateService.class);
        reportServiceClient = mock(ReportServiceClient.class);
        templatePreviewService = new TemplatePreviewService(reportTemplateService, reportServiceClient);
    }

    private ReportTemplate template(String previewId) {
        ReportTemplate template = ReportTemplate.builder().id("t1").fileId("design").previewId(previewId).build();
        when(reportTemplateService.getTemplate("t1")).thenReturn(template);
        return template;
    }

    private static UploadFileResponse preview(String fileId) {
        UploadFileResponse response = new UploadFileResponse();
        response.setFileId(fileId);
        return response;
    }

    @Test
    public void shouldReturnExistingPreview() {
        template("existing");

        assertThat(templatePreviewService.previewFileId("t1")).contains("existing");
        verify(reportServiceClient, never()).generatePdfPreview(anyString());
    }

    @Test
    public void shouldCreateAndStoreMissingPreview() {
        ReportTemplate template = template("");
        when(reportServiceClient.generatePdfPreview("design")).thenReturn(preview("new-preview"));

        assertThat(templatePreviewService.previewFileId("t1")).contains("new-preview");
        assertThat(template.getPreviewId()).isEqualTo("new-preview");
        verify(reportTemplateService).updateTemplate(eq("t1"), any(ReportTemplate.class));
    }

    @Test
    public void shouldNotRetryFailedPreviewUntilTemplateChanged() {
        template(null);
        when(reportServiceClient.generatePdfPreview("design"))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThat(templatePreviewService.previewFileId("t1")).isEmpty();
        assertThat(templatePreviewService.previewFileId("t1")).isEmpty();
        verify(reportServiceClient, times(1)).generatePdfPreview("design");

        templatePreviewService.templateChanged("t1");
        assertThat(templatePreviewService.previewFileId("t1")).isEmpty();
        verify(reportServiceClient, times(2)).generatePdfPreview("design");
    }
}
