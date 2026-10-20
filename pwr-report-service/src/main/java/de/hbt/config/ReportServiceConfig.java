package de.hbt.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "export")
public class ReportServiceConfig {


    /**
     * datasource used for preview rendering. Contains some sample data that will be written into the sample.
     */
    private String xmlFilePath;

    /**
     * Profile pictures are stored here. BIRT needs them on the filesystem, and this is where the
     * profile pictures are stored.
     */
    private String imgLocation;

    private boolean deleteDataSource = true;

    /**
     * Rendering a preview (PDF, HTML) is cancelled after this time, see BirtRendering
     */
    private long previewTimeLimitSeconds = 60;
}
