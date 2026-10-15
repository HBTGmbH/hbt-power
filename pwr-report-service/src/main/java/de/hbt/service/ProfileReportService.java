package de.hbt.service;

import de.hbt.client.ProfilePictureClient;
import de.hbt.config.ReportServiceConfig;
import de.hbt.exceptions.StorageFileException;
import de.hbt.model.ReportInfo;
import de.hbt.model.ReportStatus;
import de.hbt.model.export.Profil;
import de.hbt.model.export.birt.DocBirtExportHandler;
import de.hbt.model.export.birt.HtmlBirtExportHandler;
import de.hbt.model.export.birt.PdfBirtExportHandler;
import de.hbt.model.files.DBFile;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;

@Slf4j
@Service
public class ProfileReportService {

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

    public String generateHTMLFile(String designId) {
        DBFile file = storageService.getFile(designId);
        InputStream designFileStream = new ByteArrayInputStream(file.getData());
        String fullFilePath = htmlBirtExportHandler.exportProfile(designFileStream);
        return saveFileInDB(fullFilePath, "text/html").getId();
    }

    public String generatePDFFile(String designId) {
        DBFile file = storageService.getFile(designId);
        InputStream designFileStream = new ByteArrayInputStream(file.getData());
        String fullFilePath = pdfBirtExportHandler.exportProfile(designFileStream);

        return saveFileInDB(fullFilePath, "application/pdf").getId();
    }

    private DBFile saveFileInDB(String filePath, String fileType) {
        File file = new File(filePath);
        FileItem fileItem = new DiskFileItem("file", fileType, false, file.getName(), (int) file.length(), file.getParentFile());
        try {
            InputStream input = new FileInputStream(file);
            OutputStream os = fileItem.getOutputStream();
            IOUtils.copy(input, os);
        } catch (IOException ex) {
            throw new StorageFileException("Could not convert File to MultipartFile");
        }

        MultipartFile multipartFile = new CommonsMultipartFile(fileItem);
        DBFile f = storageService.storeFile(multipartFile);
        try {
            //noinspection ResultOfMethodCallIgnored
            file.delete();
        } catch (SecurityException e) {
            throw new StorageFileException("Could not delete File after saving it.");
        }
        return f;
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
        ResponseEntity<byte[]> response = profilePictureClient.getPictureByInitials(initials);
        String contentType = response.getHeaders().get("Content-Type").get(0);
        String fileEnding = "";
        if (contentType.equals("image/jpeg")) {
            fileEnding = ".jpeg";
        }
        if (contentType.equals("image/jpg")) {
            fileEnding = ".jpg";
        }
        if (contentType.equals("image/png")) {
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
}
