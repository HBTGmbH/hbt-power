package de.hbt.model.export.birt;

import org.eclipse.birt.report.engine.api.HTMLRenderOption;
import org.eclipse.birt.report.engine.api.IReportEngine;
import de.hbt.config.ReportServiceConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.Duration;

@Component
public class HtmlBirtExportHandler {

    private final IReportEngine birtEngine;
    private final ReportServiceConfig reportServiceConfig;

    @Autowired
    public HtmlBirtExportHandler(IReportEngine birtEngine, ReportServiceConfig reportServiceConfig) {
        this.birtEngine = birtEngine;
        this.reportServiceConfig = reportServiceConfig;
    }

    /**
     * Renders the design as HTML, filled with the XML data source.
     *
     * @throws de.hbt.exceptions.ReportRenderException if BIRT cannot render it
     */
    public byte[] exportProfile(InputStream designFileStream, String xmlDataSourcePath) {
        HTMLRenderOption options = new HTMLRenderOption();
        options.setOutputFormat(HTMLRenderOption.OUTPUT_FORMAT_HTML);
        return BirtRendering.render(birtEngine, designFileStream, xmlDataSourcePath, options,
                Duration.ofSeconds(reportServiceConfig.getPreviewTimeLimitSeconds()));
    }
}
