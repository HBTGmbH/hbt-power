package de.hbt.controller;

import de.hbt.model.ReportFileRef;
import de.hbt.model.ReportInfo;
import de.hbt.model.export.Profil;
import de.hbt.model.files.DBFile;
import de.hbt.service.ModelConvertService;
import de.hbt.service.ProfileReportService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StopWatch;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.net.URI;
import java.util.List;



@RestController
@RequestMapping(value = "/report")
public class ReportController {

    private final ProfileReportService profileReportService;
    private final ModelConvertService ModelConvertService;

    private static final Logger LOG = LogManager.getLogger(ReportController.class);

    @Value("${export.kurztextCharsPerLine}")
    private int kurztextCharsPerLine;

    @Value("${export.lang}")
    private String language;

    private final HttpServletRequest request;

    @Autowired
    public ReportController(ProfileReportService profileReportService, ModelConvertService modelConvertService, HttpServletRequest request) {
        this.profileReportService = profileReportService;
        this.ModelConvertService = modelConvertService;
        this.request = request;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/refs/{initials}")
    public ResponseEntity<List<ReportFileRef>> getAllRefs(@PathVariable("initials") String initials) {
        return ResponseEntity.ok(profileReportService.getAllRefs(initials));
    }


    // TODO xml datei ändern für angefragte rolle!!
    /*
        TODO Datei in einer DB speichern und auf anfrage ausgeben
    */
    @RequestMapping(method = RequestMethod.POST, consumes = "application/json", produces = "application/json")
    public ResponseEntity<String> generate(@RequestBody ReportInfo reportInfo,
                                           @RequestParam("type") String type,
                                           @RequestParam(value = "charsperline", required = false) String charsPerLine) throws Exception {
        File xmlFile = null;
        StopWatch stopWatch = new StopWatch();
        String initials = reportInfo.initials;


        if (charsPerLine != null) {
            kurztextCharsPerLine = Integer.parseInt(charsPerLine);
        }

        LOG.info(String.format("Starting export document generation(%s) for %s",type,initials));
        try {
            stopWatch.start("Model conversion for profile " + initials);
            DBFile dbFile;
            Profil profile = ModelConvertService.convert(reportInfo);
            stopWatch.stop();

            stopWatch.start("Marshalling to XML for profile " + initials);
            xmlFile = profileReportService.marshalToXML(profile);
            stopWatch.stop();
            LOG.info("xml fileId: "+xmlFile.getAbsolutePath());
            stopWatch.start("BIRT Report generation for profile " + initials);
            if ("DOC".equals(type)) {
                dbFile = profileReportService.generateDocXExport(xmlFile, reportInfo);
                LOG.info(dbFile);
            } else {
                //TODO change into better Exception
                throw new RuntimeException("Unsupported type " + type);
            }
            stopWatch.stop();
            LOG.info(stopWatch.prettyPrint());
            return ResponseEntity.ok(dbFile.getFilename());
        } finally {
            if (xmlFile != null) {
                xmlFile.delete();
            }
        }
    }
}
