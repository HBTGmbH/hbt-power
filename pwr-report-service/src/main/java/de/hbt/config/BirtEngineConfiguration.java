package de.hbt.config;

import de.hbt.model.export.birt.PdfFonts;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.eclipse.birt.core.exception.BirtException;
import org.eclipse.birt.core.framework.Platform;
import org.eclipse.birt.report.engine.api.EngineConfig;
import org.eclipse.birt.report.engine.api.IEngineConfig;
import org.eclipse.birt.report.engine.api.IReportEngine;
import org.eclipse.birt.report.engine.api.IReportEngineFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.util.logging.Level;

/**
 * The BIRT engine, with the fonts for PDFs (see PdfFonts). A configuration of its own, so slice tests such as
 * {@code @JsonTest} do not start it.
 */
@Configuration
public class BirtEngineConfiguration {

    private static final Logger LOG = LogManager.getLogger(BirtEngineConfiguration.class);

    @Bean(name = "birtEngine")
    public IReportEngine birtEngine(ApplicationContext context, ReportServiceConfig reportServiceConfig) {
        LOG.info("Initializing BIRT engine.");
        IReportEngine engine;
        try {
            EngineConfig config = new EngineConfig();
            //noinspection unchecked
            config.getAppContext().put("spring", context);
            config.setProperty(IEngineConfig.LOG_LEVEL, Level.OFF);
            PdfFonts.fontConfig(Path.of(reportServiceConfig.getFontDirectory()),
                    Path.of(reportServiceConfig.getFallbackFontDirectory()))
                    .ifPresent(config::setFontConfig);
            Platform.startup(config);
            IReportEngineFactory factory = (IReportEngineFactory) Platform
                    .createFactoryObject(IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY);
            engine = factory.createReportEngine(config);
            LOG.info("BIRT Engine initialized");
        } catch (BirtException e) {
            LOG.error("Could not initialize BIRT Engine.", e);
            throw new RuntimeException(e);
        }
        return engine;
    }
}
