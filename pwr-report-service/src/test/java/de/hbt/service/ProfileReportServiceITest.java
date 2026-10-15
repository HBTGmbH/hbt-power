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
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;

import javax.transaction.Transactional;
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

    @Test
    @Transactional
    void shouldGenerateReport() {
        ResponseEntity<byte[]> response = ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body("tst".getBytes());
        Mockito.when(profilePictureClient.getPictureByInitials("tst")).thenReturn(response);
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

        ReportData persistedData = reportDataService.getReportDataById(reportData.getId());
        assertThat(persistedData.getReportStatus()).isEqualTo(ReportStatus.DONE);
        assertThat(persistedData.getData()).hasSizeGreaterThan(1000);
    }
}
