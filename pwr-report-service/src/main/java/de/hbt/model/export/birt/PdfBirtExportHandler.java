package de.hbt.model.export.birt;

import org.eclipse.birt.report.engine.api.*;
import org.eclipse.birt.report.model.api.OdaDataSourceHandle;
import org.eclipse.birt.report.model.api.ReportDesignHandle;
import org.eclipse.birt.report.model.api.activity.SemanticException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

@Component
public class PdfBirtExportHandler {

    @Value("${export.htmlLocalLocation}")
    private String localLocation;

    @Value("${export.xmlFilePath}")
    private String xmlDatasource;

    private final IReportEngine birtEngine;

    private static DateFormat df = new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss");

    @Autowired
    public PdfBirtExportHandler(IReportEngine birtEngine) {
        this.birtEngine = birtEngine;
    }

    @SuppressWarnings("unchecked")
    public String exportProfile(InputStream designFileStream) throws IOException, EngineException, SemanticException {

        try {

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
                    HtmlBirtExportHandler.class.getClassLoader());

            String suff = "preview_" + df.format(new Date()) + ".pdf";
            String outputFilename = String.format(localLocation, suff);

            PDFRenderOption options = new PDFRenderOption();


            OutputStream outputStream = new ByteArrayOutputStream();
            options.setOutputFileName(outputFilename);
            options.setOutputStream(outputStream);
            options.setOutputFormat(PDFRenderOption.OUTPUT_FORMAT_PDF);

            task.setRenderOption(options);


            /* run and render report */
            task.run();
            task.close();
            return outputFilename;
        } catch (Exception e) {
            return "ReportFailed: " + e;
        }
    }
}
