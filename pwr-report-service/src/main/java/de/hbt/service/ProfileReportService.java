package de.hbt.service;

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
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.eclipse.birt.report.engine.api.EngineException;
import org.eclipse.birt.report.model.api.activity.SemanticException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

//import org.apache.log4j.Logger;

@Slf4j
@Service
public class ProfileReportService {

    @Value("${export.expiration-in-days}")
    private Integer expirationInDays;

    private final DocBirtExportHandler docBirtExportHandler;
    private DBFileStorageService storageService;
    private final HtmlBirtExportHandler htmlBirtExportHandler;
    private final PdfBirtExportHandler pdfBirtExportHandler;
    private final ReportDataService reportDataService;

    private static final DateFormat df = new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss");

    @Autowired
    public ProfileReportService(DocBirtExportHandler docBirtExportHandler,
                                DBFileStorageService storageService,
                                HtmlBirtExportHandler htmlBirtExportHandler,
                                PdfBirtExportHandler pdfBirtExportHandler, ReportDataService reportDataService) {
        this.docBirtExportHandler = docBirtExportHandler;
        this.storageService = storageService;
        this.htmlBirtExportHandler = htmlBirtExportHandler;
        this.pdfBirtExportHandler = pdfBirtExportHandler;

        this.reportDataService = reportDataService;
    }

    /**
     * Marshalls the profile into an XML file
     *
     * @param profile UserProfile
     */
    public File marshalToXML(Profil profile) {
        try {
            File file = File.createTempFile("tempXMLexport", ".xml");
            JAXBContext jaxbContext = JAXBContext.newInstance(Profil.class);
            Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
            jaxbMarshaller.setProperty(Marshaller.JAXB_ENCODING, "iso-8859-1");
            jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            jaxbMarshaller.marshal(profile, file);
            return file;
        } catch (JAXBException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Async
    public void generateDocXExport(File xmlFile, ReportInfo reportInfo, Long reportDataId) throws RuntimeException, IOException {
        String fullFilePath = "";
        try {
            InputStream designFileStream = new ByteArrayInputStream(storageService.getFile(reportInfo.reportTemplate.fileId).getData());

            String outputFileName = reportInfo.initials + "_export_" + df.format(new Date()) + ".docx";
            fullFilePath = docBirtExportHandler.exportProfile(reportInfo.initials, outputFileName, xmlFile.getAbsolutePath(), designFileStream, "docx");
            saveAsReportData(fullFilePath, reportDataId);
        } catch (Exception e) {
            setReportDataError(reportDataId);
            e.printStackTrace();
        } finally {
            Files.deleteIfExists(Paths.get(fullFilePath));
        }

    }

    private void setReportDataError(Long reportDataId) {
        reportDataService.updateReportData(reportDataId, ReportStatus.ERROR);
    }

    private void saveAsReportData(String fullFilePath, Long reportDataId) throws IOException {
        File file = new File(fullFilePath);
        reportDataService.updateReportData(reportDataId, FileUtils.readFileToByteArray(file));
    }

    public String generateHTMLFile(String designId) throws SemanticException, EngineException, IOException {
        DBFile file = storageService.getFile(designId);
        InputStream designFileStream = new ByteArrayInputStream(file.getData());
        String fullFilePath = htmlBirtExportHandler.exportProfile(designFileStream);

        return saveFileInDB(fullFilePath, "text/html").getId();
    }

    public String generatePDFFile(String designId) throws SemanticException, EngineException, IOException {
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
            file.delete();
        } catch (SecurityException e) {
            throw new StorageFileException("Could not delete File after saving it.");
        }
        return f;
    }
}
