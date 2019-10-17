package de.hbt.service;

import de.hbt.data.ReportFileRepository;
import de.hbt.exceptions.StorageFileException;
import de.hbt.model.ReportFileRef;
import de.hbt.model.ReportInfo;
import de.hbt.model.export.Profil;
import de.hbt.model.export.birt.DocBirtExportHandler;
import de.hbt.model.export.birt.HtmlBirtExportHandler;
import de.hbt.model.export.birt.PdfBirtExportHandler;
import de.hbt.model.files.DBFile;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.eclipse.birt.report.engine.api.EngineException;
import org.eclipse.birt.report.model.api.activity.SemanticException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.StreamUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

//import org.apache.log4j.Logger;


@Service
public class ProfileReportService {

    @Value("${export.wordURLLocation}")
    private String wordURLLocation;

    @Value("${export.reportLocation}")
    private String reportLocation;

    @Value("${export.expiration-in-days}")
    private Integer expirationInDays;

    @Value("${export.designFile}")
    private String currentDesignFile; // TODO make ID

    @Value("${export.xmlFilePath}")
    private String xmlFilePath;

    @Value("${export.designFileDirectory}")
    private String previewDirectory;

    @Value("${export.designFileDirectory}")
    private String pathString;

    private final DocBirtExportHandler docBirtExportHandler;
    private final ReportFileRepository reportFileRepository;
    private DBFileStorageService storageService;
    private final HtmlBirtExportHandler htmlBirtExportHandler;
    private final PdfBirtExportHandler pdfBirtExportHandler;

    private static final DateFormat df = new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss");

    //private static final Logger LOG = Logger.getLogger(ProfileReportService.class);


    @Autowired
    public ProfileReportService(DocBirtExportHandler docBirtExportHandler,
                                ReportFileRepository reportFileRepository,
                                DBFileStorageService storageService,
                                HtmlBirtExportHandler htmlBirtExportHandler,
                                PdfBirtExportHandler pdfBirtExportHandler) {
        this.docBirtExportHandler = docBirtExportHandler;
        this.reportFileRepository = reportFileRepository;
        this.storageService = storageService;
        this.htmlBirtExportHandler = htmlBirtExportHandler;
        this.pdfBirtExportHandler = pdfBirtExportHandler;

    }


    private void saveAndCreateRef(String fullPath, String initials) {
        ReportFileRef reportFileRef = new ReportFileRef();
        reportFileRef.setCreationDate(LocalDate.now());
        reportFileRef.setFullPath(fullPath);
        reportFileRef.setInitials(initials);
        reportFileRepository.save(reportFileRef);
    }

    public List<ReportFileRef> getAllRefs(String initials) {
        return StreamUtils.createStreamFromIterator(reportFileRepository.findAll().iterator())
                .filter(reportFileRef -> initials.equals(reportFileRef.getInitials()))
                .collect(Collectors.toList());
    }


    private boolean isExpiredFile(ReportFileRef reportFileRef) {
        return Duration.between(reportFileRef.getCreationDate().atStartOfDay(), LocalDate.now().atStartOfDay()).toDays() > expirationInDays;
    }

    private boolean isInvalidRef(ReportFileRef reportFileRef) {
        return !(new File(reportFileRef.getFullPath()).exists());
    }

    private boolean deleteRefWithFile(ReportFileRef reportFileRef) {
        File file = new File(reportFileRef.getFullPath());
        boolean deleted = false;
        if (file.exists()) {
            // Only delete ref if file deletion was successful...
            if (file.delete()) {
                reportFileRepository.delete(reportFileRef);
                deleted = true;
            }
        } else {
            // ... or if the file didn't exist in the first place.
            reportFileRepository.delete(reportFileRef);
            deleted = true;
        }
        return deleted;
    }

    private void cleanUpExpiredFiles() {
        //LOG.info("Cleaning up expired files...");
        long deleted = StreamUtils.createStreamFromIterator(reportFileRepository.findAll().iterator())
                .filter(this::isExpiredFile)
                .map(this::deleteRefWithFile)
                .filter(aBoolean -> aBoolean)
                .count();
        //LOG.info("Done. Deleted " + deleted + " file refs.");
    }

    private void cleanUpInvalidRefs() {
        //LOG.info("Cleaning up invalid refs...");
        long deleted = StreamUtils.createStreamFromIterator(reportFileRepository.findAll().iterator())
                .filter(this::isInvalidRef)
                .map(ref -> {
                    reportFileRepository.delete(ref);
                    return 1;
                })
                .count();
        //LOG.info("Done. Deleted " + deleted + " invalid file refs.");
    }

    private void cleanUpFileSystem() {
        //LOG.info("Cleaning up file system...");
        List<String> existingFilePaths = StreamUtils.createStreamFromIterator(reportFileRepository.findAll().iterator())
                .map(ReportFileRef::getFullPath)
                .collect(Collectors.toList());
        long deleted = FileUtils.listFiles(new File(reportLocation), new String[]{"docx"}, true)
                .stream()
                .filter(file -> !existingFilePaths.contains(file.getAbsolutePath()))
                .map(File::delete)
                .filter(Boolean::booleanValue)
                .count();
        //LOG.info("Done. Deleted " + deleted + " files from the file system.");
    }

    /**
     * Performs clean-up of all existing reports and reports ref.
     * <br/>
     * <br/>
     * Reads all refs from the database and removes the file if file is expired<br/>
     * Reads all refs from the database and removes all refs whose file is no longer existing<br/>
     * Reads all files from the file system and removes all files without a ref.<br/>
     */
    @Scheduled(fixedRate = 3600000)
    public void cleanUpReports() {
        cleanUpExpiredFiles();
        cleanUpInvalidRefs();
        cleanUpFileSystem();
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


    public DBFile generateDocXExport(File xmlFile, ReportInfo reportInfo) throws EngineException, RuntimeException, IOException, SemanticException {
        InputStream designFileStream = new ByteArrayInputStream(storageService.getFile(reportInfo.reportTemplate.fileId).getData());

        String outputFileName = reportInfo.initials + "_export_" + df.format(new Date()) + ".docx";
        String fullFilePath = docBirtExportHandler.exportProfile(reportInfo.initials, outputFileName, xmlFile.getAbsolutePath(), designFileStream, "docx");
        saveAndCreateRef(fullFilePath, reportInfo.initials);
        return saveFileAsBlob(fullFilePath);
    }

    private DBFile saveFileAsBlob(String filePath) throws IOException{
        File file  = new File(filePath);
        DBFile dbFile = storageService.storeFile("filePath","docx",FileUtils.readFileToByteArray(file));
        return dbFile;
    }

    public String generateHTMLFile(String designId) throws SemanticException, EngineException, IOException {
        DBFile file = (storageService.getFile(designId) != null ? storageService.getFile(designId) : storageService.getFile(currentDesignFile));
        InputStream designFileStream = new ByteArrayInputStream(file.getData());
        String fullFilePath = htmlBirtExportHandler.exportProfile(designFileStream);

        return saveFileInDB(fullFilePath,"text/html").getId();
    }

    public String generatePDFFile(String designId) throws SemanticException, EngineException, IOException {
        DBFile file = (storageService.getFile(designId) != null ? storageService.getFile(designId) : storageService.getFile(currentDesignFile));
        InputStream designFileStream = new ByteArrayInputStream(file.getData());
        String fullFilePath = pdfBirtExportHandler.exportProfile(designFileStream);

        return saveFileInDB(fullFilePath,"application/pdf").getId();
    }

    private DBFile saveFileInDB(String filePath, String fileType) throws IOException {
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
