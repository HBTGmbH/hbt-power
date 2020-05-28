package de.hbt.model.export.birt;


import org.eclipse.birt.report.engine.api.*;
import org.eclipse.birt.report.model.api.OdaDataSourceHandle;
import org.eclipse.birt.report.model.api.ReportDesignHandle;
import org.eclipse.birt.report.model.api.activity.SemanticException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

import lombok.extern.log4j.Log4j2;

@Component
@Log4j2
public class DocBirtExportHandler {

    @Value("${export.wordLocalLocation}")
    private String localLocation;

    private final IReportEngine birtEngine;

    @Autowired
    public DocBirtExportHandler(IReportEngine birtEngine) {
        this.birtEngine = birtEngine;
    }


    /**
     * {@inheritDoc}
     *
     * @throws SemanticException
     */
    @SuppressWarnings("unchecked")
    public String exportProfile(String kuerzel, String ausgabedatei, String xmlDatasource, InputStream designFileStream, String format) throws IOException, EngineException, SemanticException {
        log.debug("Generating profile for " + kuerzel + " to file " + ausgabedatei);
        log.debug("XML datasource is " + xmlDatasource + " and local location is " + localLocation);
        try {
            /* Open the report design */

            // opens the designFile ( which is InputStream)
            IReportRunnable design = birtEngine.openReportDesign(designFileStream);

            // Represents the overall report design. The report design defines a set of properties that describe the design as a whole like author, base and comments etc.
            //Besides properties, it also contains a variety of elements that make up the report
            ReportDesignHandle report = (ReportDesignHandle) design.getDesignHandle();

            // Creates a DataSourceHandle from "Profile Data Source"
            // Represents a extended data source.
            OdaDataSourceHandle dataSourceHandle = (OdaDataSourceHandle) report.findDataSource("Profil Data Source");

            // Sets the Property FILELIST to the xml Source
            dataSourceHandle.setProperty("FILELIST", xmlDatasource);

            /* Create task to run and render the report */
            IRunAndRenderTask task = birtEngine.createRunAndRenderTask(design);

            /* Set parent classloader for engine */
            task.getAppContext().put(EngineConstants.APPCONTEXT_CLASSLOADER_KEY,
                    DocBirtExportHandler.class.getClassLoader());

            String outputFilename = "";


            /* Setup rendering to DOCX */
            DocxRenderOption options = new DocxRenderOption();

            outputFilename = String.format(localLocation, kuerzel, ausgabedatei);

            options.setOutputFileName(outputFilename);
            options.setOutputFormat(format);

            task.setRenderOption(options);


            /* run and render report */
            task.run();
            task.close();
            log.debug("Report created to " + outputFilename);
            return outputFilename;
        } catch (Exception e) {
            log.error("Report Failed", e);
            throw e;
        }
    }


}
