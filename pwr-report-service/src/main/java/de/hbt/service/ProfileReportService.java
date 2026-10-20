package de.hbt.service;

import de.hbt.client.ProfilePictureClient;
import de.hbt.config.ReportServiceConfig;
import de.hbt.model.ReportInfo;
import de.hbt.model.ReportStatus;
import de.hbt.model.export.Profil;
import de.hbt.model.export.birt.DocBirtExportHandler;
import de.hbt.model.export.birt.HtmlBirtExportHandler;
import de.hbt.model.export.birt.PdfBirtExportHandler;
import de.hbt.model.files.DBFile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.text.SimpleDateFormat;
import java.util.Date;

@Slf4j
@Service
public class ProfileReportService {

    /**
     * Shown in the export document instead of the photo of a consultant without a profile picture
     */
    static final String PROFILE_PICTURE_PLACEHOLDER = "images/profile-picture-placeholder.png";

    private final DocBirtExportHandler docBirtExportHandler;
    private final DBFileStorageService storageService;
    private final HtmlBirtExportHandler htmlBirtExportHandler;
    private final PdfBirtExportHandler pdfBirtExportHandler;
    private final ReportDataService reportDataService;
    private final ModelConvertService modelConvertService;
    private final ReportServiceConfig reportServiceConfig;
    private final ProfilePictureClient profilePictureClient;

    @Autowired
    public ProfileReportService(DocBirtExportHandler docBirtExportHandler,
                                DBFileStorageService storageService,
                                HtmlBirtExportHandler htmlBirtExportHandler,
                                PdfBirtExportHandler pdfBirtExportHandler,
                                ReportDataService reportDataService,
                                ModelConvertService modelConvertService, ReportServiceConfig reportServiceConfig, ProfilePictureClient profilePictureClient) {
        this.docBirtExportHandler = docBirtExportHandler;
        this.storageService = storageService;
        this.htmlBirtExportHandler = htmlBirtExportHandler;
        this.pdfBirtExportHandler = pdfBirtExportHandler;
        this.reportDataService = reportDataService;
        this.modelConvertService = modelConvertService;
        this.reportServiceConfig = reportServiceConfig;
        this.profilePictureClient = profilePictureClient;
    }

    /**
     * Invokes asynchronous generation of the export document. Exports are always based on
     * an XML data source that has been previously marshalled from the input data.
     * This file has been created by the spawning thread and has to be deleted once this asynchronous
     * action completes
     */
    @Async
    public void generateDocXExport(ReportInfo reportInfo, Long reportDataId) throws RuntimeException {
        File xmlFile = null;
        try {
            log.debug("[Export][{}] Incoming render request. ReportTemplateIdFileId: {}", reportInfo.initials, reportInfo.reportTemplate.fileId);
            String pictureFilePath = saveImageOnDisk(reportInfo.initials);
            DBFile dbFile = storageService.getFile(reportInfo.reportTemplate.fileId);
            Profil profile = modelConvertService.convert(reportInfo, pictureFilePath);
            log.debug("[Export][{}]Profile converted, now generationg XML datasource file.", reportInfo.initials);
            xmlFile = marshalToXML(profile);
            log.debug("[Export][{}] Creating report based on XML data source {}", reportInfo.initials, xmlFile.getAbsolutePath());
            InputStream designFileStream = new ByteArrayInputStream(dbFile.getData());
            byte[] reportContent = docBirtExportHandler.exportProfile(reportInfo.initials, xmlFile, designFileStream);
            log.debug("[Export][{}] Created .docx with {} bytes", reportInfo.initials, reportContent.length);
            reportDataService.updateReportData(reportDataId, reportContent);
            log.debug("[Export][{}] Completed", reportInfo.initials);
        } catch (Exception e) {
            log.error("[Export] Failed to create report", e);
            setReportDataError(reportDataId);
        } finally {
            if (xmlFile != null && reportServiceConfig.isDeleteDataSource()) {
                //noinspection ResultOfMethodCallIgnored
                xmlFile.delete();
            } else {
                log.debug("[Export][{}] Data source not deleted", reportInfo.initials);
            }
        }
    }

    private void setReportDataError(Long reportDataId) {
        reportDataService.updateReportData(reportDataId, ReportStatus.ERROR);
    }

    /**
     * Renders the design as HTML with the sample data of the preview data source and stores it.
     *
     * @return id of the stored file
     */
    public String generateHTMLFile(String designId) {
        DBFile file = storageService.getFile(designId);
        byte[] html = htmlBirtExportHandler.exportProfile(new ByteArrayInputStream(file.getData()), reportServiceConfig.getXmlFilePath());
        return storageService.storeFile(previewFilename("html"), "text/html", html).getId();
    }

    /**
     * Renders the design as PDF with the sample data of the preview data source and stores it.
     *
     * @return id of the stored file
     */
    public String generatePDFFile(String designId) {
        DBFile file = storageService.getFile(designId);
        byte[] pdf = pdfBirtExportHandler.exportProfile(new ByteArrayInputStream(file.getData()), reportServiceConfig.getXmlFilePath());
        return storageService.storeFile(previewFilename("pdf"), "application/pdf", pdf).getId();
    }

    private static String previewFilename(String extension) {
        return "preview_" + new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss").format(new Date()) + "." + extension;
    }


    /**
     * Marshalls the profile into an XML file
     * The resulting XML file is used to generate the BIRT report. Our BIRT Engine templates
     * rely on these XML datasources to create the export documents
     */
    private File marshalToXML(Profil profile) {
        try {
            File file = File.createTempFile("tempXMLexport", ".xml");
            JAXBContext jaxbContext = JAXBContext.newInstance(Profil.class);
            Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
            jaxbMarshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
            jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            jaxbMarshaller.marshal(profile, file);
            return file;
        } catch (JAXBException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String saveImageOnDisk(String initials) {
        ResponseEntity<byte[]> response;
        try {
            response = profilePictureClient.getPictureByInitials(initials);
        } catch (HttpClientErrorException.NotFound e) {
            log.info("[Export][{}] No profile picture, using placeholder", initials);
            return savePlaceholderOnDisk(initials);
        }
        String contentType = response.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        String fileEnding = "";
        if ("image/jpeg".equals(contentType)) {
            fileEnding = ".jpeg";
        }
        if ("image/jpg".equals(contentType)) {
            fileEnding = ".jpg";
        }
        if ("image/png".equals(contentType)) {
            fileEnding = ".png";
        }
        try {
            File tempFile = File.createTempFile("foto_" + initials, fileEnding);
            tempFile.deleteOnExit();
            Files.write(tempFile.toPath(), response.getBody(), StandardOpenOption.WRITE);
            return tempFile.getAbsolutePath();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String savePlaceholderOnDisk(String initials) {
        try (InputStream placeholder = new ClassPathResource(PROFILE_PICTURE_PLACEHOLDER).getInputStream()) {
            File tempFile = File.createTempFile("foto_" + initials, ".png");
            tempFile.deleteOnExit();
            Files.copy(placeholder, tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            return tempFile.getAbsolutePath();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
