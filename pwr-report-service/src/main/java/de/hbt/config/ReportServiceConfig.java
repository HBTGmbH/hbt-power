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
}
