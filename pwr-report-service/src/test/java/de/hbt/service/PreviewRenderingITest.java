package de.hbt.service;

import de.hbt.client.ProfilePictureClient;
import de.hbt.config.ReportServiceConfig;
import de.hbt.exceptions.ReportRenderException;
import de.hbt.model.ReportInfo;
import de.hbt.model.export.Profil;
import de.hbt.model.files.DBFile;
import de.hbt.model.view.ViewProfile;
import de.hbt.repository.DBFileRepository;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;

import javax.transaction.Transactional;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Previews of report templates, rendered with the sample data of the preview data source (export.xmlFilePath).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Import(TestConfiguration.class)
class PreviewRenderingITest {

    @Autowired
    private ProfileReportService profileReportService;

    @Autowired
    private DBFileRepository dbFileRepository;

    @Autowired
    private ModelConvertService modelConvertService;

    @Autowired
    private ReportServiceConfig reportServiceConfig;

    @MockBean
    private ProfilePictureClient profilePictureClient;

    private String configuredXmlFilePath;
    private File sampleData;

    @BeforeEach
    @SneakyThrows
    void writeSampleData() {
        configuredXmlFilePath = reportServiceConfig.getXmlFilePath();
        File picture = File.createTempFile("preview-picture", ".png");
        Files.write(picture.toPath(), new ClassPathResource(ProfileReportService.PROFILE_PICTURE_PLACEHOLDER).getInputStream().readAllBytes());

        ReportInfo reportInfo = new ReportInfo();
        reportInfo.initials = "tst";
        reportInfo.name = "Erika Testerin";
        reportInfo.viewProfile = new ViewProfile().toBuilder()
                .id("1234")
                .viewDescription("Beispiel")
                .ownerInitials("tst")
                .build();
        Profil profile = modelConvertService.convert(reportInfo, picture.getAbsolutePath());

        sampleData = File.createTempFile("preview-datasource", ".xml");
        Marshaller marshaller = JAXBContext.newInstance(Profil.class).createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_ENCODING, StandardCharsets.UTF_8.name());
        marshaller.marshal(profile, sampleData);
        reportServiceConfig.setXmlFilePath(sampleData.getAbsolutePath());
    }

    @AfterEach
    void restoreConfig() {
        reportServiceConfig.setXmlFilePath(configuredXmlFilePath);
        //noinspection ResultOfMethodCallIgnored
        sampleData.delete();
    }

    @SneakyThrows
    private DBFile persistStandardTemplate() {
        byte[] design = new ClassPathResource("templates/designfile_hbt_standard.rptdesign").getInputStream().readAllBytes();
        return dbFileRepository.saveAndFlush(new DBFile("designfile_hbt_standard.rptdesign", "application/octet-stream", design));
    }

    @Test
    @Transactional
    void shouldRenderPdfPreviewOfStandardTemplate() {
        DBFile design = persistStandardTemplate();

        String previewId = profileReportService.generatePDFFile(design.getId());

        DBFile preview = dbFileRepository.findById(previewId).orElseThrow();
        assertThat(preview.getFiletype()).isEqualTo("application/pdf");
        assertThat(preview.getFilename()).startsWith("preview_").endsWith(".pdf");
        assertThat(preview.getData()).hasSizeGreaterThan(1000);
        assertThat(new String(Arrays.copyOf(preview.getData(), 5), StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
    }

    @Test
    @Transactional
    void shouldRenderHtmlPreviewOfStandardTemplate() {
        DBFile design = persistStandardTemplate();

        String previewId = profileReportService.generateHTMLFile(design.getId());

        DBFile preview = dbFileRepository.findById(previewId).orElseThrow();
        assertThat(preview.getFiletype()).isEqualTo("text/html");
        assertThat(new String(preview.getData(), StandardCharsets.UTF_8)).contains("<html");
    }

    /**
     * Before #65 the cover of the standard template was 9.32in high, more than the body of an A4 page: BIRT then
     * added pages forever (PDF)
     */
    @Test
    @Transactional
    @SneakyThrows
    void shouldCancelRenderingOfDesignHigherThanThePage() {
        String design = new String(new ClassPathResource("templates/designfile_hbt_standard.rptdesign").getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        byte[] tooHigh = design.replace("<property name=\"height\">9.1in</property>", "<property name=\"height\">9.32in</property>")
                .getBytes(StandardCharsets.UTF_8);
        DBFile file = dbFileRepository.saveAndFlush(new DBFile("too-high.rptdesign", "application/octet-stream", tooHigh));
        long configuredTimeLimit = reportServiceConfig.getPreviewTimeLimitSeconds();
        reportServiceConfig.setPreviewTimeLimitSeconds(5);
        try {
            assertThatThrownBy(() -> profileReportService.generatePDFFile(file.getId()))
                    .isInstanceOf(ReportRenderException.class)
                    .hasMessageContaining("cancelled");
            // cancel() has to end BIRT's loop, not only the wait for it
            Thread.sleep(2000);
            assertThat(Thread.getAllStackTraces().keySet()).noneMatch(thread -> thread.getName().equals("birt-render"));
        } finally {
            reportServiceConfig.setPreviewTimeLimitSeconds(configuredTimeLimit);
        }
    }

    @Test
    @Transactional
    void shouldFailWithCauseWhenSampleDataIsMissing() {
        DBFile design = persistStandardTemplate();
        reportServiceConfig.setXmlFilePath(new File(sampleData.getParentFile(), "does-not-exist.xml").getAbsolutePath());

        assertThatThrownBy(() -> profileReportService.generatePDFFile(design.getId()))
                .isInstanceOf(ReportRenderException.class)
                .hasCauseInstanceOf(Exception.class);
    }
}
