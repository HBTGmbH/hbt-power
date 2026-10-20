package de.hbt.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "export")
public class ReportServiceConfig {

    /**
     * XML data source and profile picture of a rendering are temporary files; keep them for debugging with false
     */
    private boolean deleteDataSource = true;

    /**
     * Rendering a PDF preview is cancelled after this time, see BirtRendering
     */
    private long previewTimeLimitSeconds = 60;

    /**
     * Directory with the HBT font Simplon Norm for PDFs (licensed: mounted as a volume, never part of a repository or
     * image). Optional, see PdfFonts
     */
    private String fontDirectory = "/fonts";

    /**
     * Directory with the free fonts (Noto Sans) that stand in for Simplon Norm, part of the image. Optional
     */
    private String fallbackFontDirectory = "/usr/share/fonts/pwr-fallback";
}
