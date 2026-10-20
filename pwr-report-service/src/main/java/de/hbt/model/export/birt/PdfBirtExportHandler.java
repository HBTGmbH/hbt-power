package de.hbt.model.export.birt;

import de.hbt.exceptions.ReportRenderException;
import org.eclipse.birt.report.engine.api.IReportEngine;
import org.eclipse.birt.report.engine.api.PDFRenderOption;
import de.hbt.config.ReportServiceConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;

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
        byte[] pdf = BirtRendering.render(birtEngine, designFileStream, xmlDataSourcePath, options,
                Duration.ofSeconds(reportServiceConfig.getPreviewTimeLimitSeconds()));
        // BIRT swallows some errors of the PDF writer (e.g. a font it cannot embed) and leaves the PDF unfinished
        if (!isComplete(pdf)) {
            throw new ReportRenderException("The PDF ends unfinished: a font could not be embedded or the layout failed",
                    null);
        }
        return pdf;
    }

    /**
     * A finished PDF ends with %%EOF (followed by at most a line break)
     */
    static boolean isComplete(byte[] pdf) {
        byte[] tail = Arrays.copyOfRange(pdf, Math.max(0, pdf.length - 32), pdf.length);
        return new String(tail, StandardCharsets.ISO_8859_1).contains("%%EOF");
    }
}
