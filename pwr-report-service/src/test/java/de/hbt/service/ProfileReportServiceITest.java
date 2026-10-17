package de.hbt.service;

import de.hbt.client.ProfilePictureClient;
import de.hbt.model.ReportData;
import de.hbt.model.ReportInfo;
import de.hbt.model.ReportStatus;
import de.hbt.model.ReportTemplate;
import de.hbt.model.files.DBFile;
import de.hbt.model.view.ViewProfile;
import de.hbt.repository.DBFileRepository;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import javax.transaction.Transactional;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Import(TestConfiguration.class)
class ProfileReportServiceITest {

    @Autowired
    private ProfileReportService profileReportService;

    @Autowired
    private DBFileRepository dbFileRepository;

    @Autowired
    private ReportDataService reportDataService;

    @MockBean
    private ProfilePictureClient profilePictureClient;

    @SpyBean
    private ModelConvertService modelConvertService;

    @SneakyThrows
    private DBFile persistTestFile() {
        DBFile dbFile = new DBFile();
        dbFile.setFilename("TestDesign.rptdesign");
        dbFile.setFiletype("application/octet-stream");
        byte[] data = ProfileReportServiceITest.class.getClassLoader()
                .getResourceAsStream("TestDesign.rptdesign")
                .readAllBytes();
        dbFile.setData(data);
        return dbFileRepository.saveAndFlush(dbFile);
    }

    private Long generateReport() {
        DBFile dbFile = persistTestFile();

        ReportData reportData = new ReportData();
        reportData.setCreateDate(LocalDate.now());
        reportData.setFileName("Test");
        reportData.setInitials("tst");
        reportData.setTemplateId(dbFile.getId());
        reportData.setViewProfileName("asda");
        reportData = reportDataService.saveReportDataInNewTransaction(reportData);


        ReportInfo reportInfo = new ReportInfo();
        reportInfo.initials = "tst";
        reportInfo.reportTemplate = new ReportTemplate("", "", dbFile.getId(), "");
        reportInfo.viewProfile = new ViewProfile().toBuilder()
                .id("1234")
                .viewDescription("Test")
                .ownerInitials("tst")
                .build();
        profileReportService.generateDocXExport(reportInfo, reportData.getId());
        return reportData.getId();
    }

    @Test
    @Transactional
    void shouldGenerateReport() {
        ResponseEntity<byte[]> response = ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body("tst".getBytes());
        Mockito.when(profilePictureClient.getPictureByInitials("tst")).thenReturn(response);

        Long reportDataId = generateReport();

        ReportData persistedData = reportDataService.getReportDataById(reportDataId);
        assertThat(persistedData.getReportStatus()).isEqualTo(ReportStatus.DONE);
        assertThat(persistedData.getData()).hasSizeGreaterThan(1000);
    }

    @Test
    @Transactional
    @SneakyThrows
    void shouldUsePlaceholderWithoutProfilePicture() {
        Mockito.when(profilePictureClient.getPictureByInitials("tst"))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found", HttpHeaders.EMPTY, null, null));

        Long reportDataId = generateReport();

        ReportData persistedData = reportDataService.getReportDataById(reportDataId);
        assertThat(persistedData.getReportStatus()).isEqualTo(ReportStatus.DONE);
        assertThat(persistedData.getData()).hasSizeGreaterThan(1000);
        ArgumentCaptor<String> picturePath = ArgumentCaptor.forClass(String.class);
        Mockito.verify(modelConvertService).convert(Mockito.any(), picturePath.capture());
        byte[] placeholder = new ClassPathResource(ProfileReportService.PROFILE_PICTURE_PLACEHOLDER).getInputStream().readAllBytes();
        assertThat(Files.readAllBytes(Paths.get(picturePath.getValue()))).isEqualTo(placeholder);
    }

    @Test
    @Transactional
    void shouldFailWhenProfilePictureCannotBeLoaded() {
        Mockito.when(profilePictureClient.getPictureByInitials("tst"))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR));

        Long reportDataId = generateReport();

        ReportData persistedData = reportDataService.getReportDataById(reportDataId);
        assertThat(persistedData.getReportStatus()).isEqualTo(ReportStatus.ERROR);
    }
}
