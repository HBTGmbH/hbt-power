package de.hbt.model.export.birt;

import org.eclipse.birt.report.engine.api.IReportEngine;
import org.eclipse.birt.report.engine.api.PDFRenderOption;
import de.hbt.config.ReportServiceConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.Duration;

@Component
public class PdfBirtExportHandler {

    private final IReportEngine birtEngine;
    private final ReportServiceConfig reportServiceConfig;

    @Autowired
    public PdfBirtExportHandler(IReportEngine birtEngine, ReportServiceConfig reportServiceConfig) {
        this.birtEngine = birtEngine;
        this.reportServiceConfig = reportServiceConfig;
    }

    /**
     * Renders the design as PDF, filled with the XML data source.
     *
     * @throws de.hbt.exceptions.ReportRenderException if BIRT cannot render it
     */
    public byte[] exportProfile(InputStream designFileStream, String xmlDataSourcePath) {
        PDFRenderOption options = new PDFRenderOption();
        options.setOutputFormat(PDFRenderOption.OUTPUT_FORMAT_PDF);
        return BirtRendering.render(birtEngine, designFileStream, xmlDataSourcePath, options,
                Duration.ofSeconds(reportServiceConfig.getPreviewTimeLimitSeconds()));
    }
}
