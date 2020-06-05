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
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;

@Slf4j
@Service
public class ProfileReportService {

    private final DocBirtExportHandler docBirtExportHandler;
    private DBFileStorageService storageService;
    private final HtmlBirtExportHandler htmlBirtExportHandler;
    private final PdfBirtExportHandler pdfBirtExportHandler;
    private final ReportDataService reportDataService;
    private final ModelConvertService modelConvertService;

    @Autowired
    public ProfileReportService(DocBirtExportHandler docBirtExportHandler,
                                DBFileStorageService storageService,
                                HtmlBirtExportHandler htmlBirtExportHandler,
                                PdfBirtExportHandler pdfBirtExportHandler,
                                ReportDataService reportDataService,
                                ModelConvertService modelConvertService) {
        this.docBirtExportHandler = docBirtExportHandler;
        this.storageService = storageService;
        this.htmlBirtExportHandler = htmlBirtExportHandler;
        this.pdfBirtExportHandler = pdfBirtExportHandler;
        this.reportDataService = reportDataService;
        this.modelConvertService = modelConvertService;
    }

    /**
     * Invokes asynchronous generation of the export document. Exports are always based on
     * an XML data source that has been previously marshalled from the input data.
     *
     * This file has been created by the spawning thread and has to be deleted once this asynchronous
     * action completes
     */
    @Async
    public void generateDocXExport(ReportInfo reportInfo, Long reportDataId) throws RuntimeException {
        File xmlFile = null;
        try {
            log.debug("[Export][{}] Incoming render request. ReportTemplateIdFileId: {}", reportInfo.initials, reportInfo.reportTemplate.fileId);
            DBFile dbFile = storageService.getFile(reportInfo.reportTemplate.fileId);
            Profil profile = modelConvertService.convert(reportInfo);
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
            if (xmlFile != null) {
                //noinspection ResultOfMethodCallIgnored
                xmlFile.delete();
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
     *
     * The resulting XML file is used to generate the BIRT report. Our BIRT Engine templates
     * rely on these XML datasources to create the export documents
     */
    private File marshalToXML(Profil profile) {
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

}
