package de.hbt.model.export.birt;


import org.eclipse.birt.report.engine.api.*;
import org.eclipse.birt.report.model.api.OdaDataSourceHandle;
import org.eclipse.birt.report.model.api.ReportDesignHandle;
import org.eclipse.birt.report.model.api.activity.SemanticException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import lombok.extern.log4j.Log4j2;

@Component
@Log4j2
public class DocBirtExportHandler {

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

    public byte[] exportProfile(String kuerzel, File xmlDataSource, InputStream designFileStream) {
        log.debug("Generating profile for " + kuerzel);
        log.debug("XML datasource is " + xmlDataSource);
        try {
            // opens the designFile ( which is InputStream)
            IReportRunnable design = birtEngine.openReportDesign(designFileStream);

            // Represents the overall report design. The report design defines a set of properties that describe the design as a whole like author, base and comments etc.
            // Besides properties, it also contains a variety of elements that make up the report
            ReportDesignHandle report = (ReportDesignHandle) design.getDesignHandle();

            // Creates a DataSourceHandle from "Profile Data Source"
            // Represents a extended data source.
            OdaDataSourceHandle dataSourceHandle = (OdaDataSourceHandle) report.findDataSource("Profil Data Source");

            // Sets the Property FILELIST to the xml Source
            dataSourceHandle.setProperty("FILELIST", xmlDataSource.getAbsolutePath());
            IRunAndRenderTask task = bootstrapTask(design);
            return renderToByteArray(task);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @SuppressWarnings("unchecked")
    private IRunAndRenderTask bootstrapTask(IReportRunnable design) {
        /* Create task to run and render the report */
        IRunAndRenderTask task = birtEngine.createRunAndRenderTask(design);
        /* Set parent classloader for engine */
        task.getAppContext().put(EngineConstants.APPCONTEXT_CLASSLOADER_KEY, DocBirtExportHandler.class.getClassLoader());
        return task;
    }

    private byte[] renderToByteArray(IRunAndRenderTask task) throws Exception {
        DocxRenderOption options = new DocxRenderOption();
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        options.setOutputFormat("docx");
        options.setOutputStream(byteArrayOutputStream);
        task.setRenderOption(options);
        task.run();
        task.close();
        return byteArrayOutputStream.toByteArray();
    }


}
