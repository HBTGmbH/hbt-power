package de.hbt;


import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.eclipse.birt.core.exception.BirtException;
import org.eclipse.birt.core.framework.Platform;
import org.eclipse.birt.report.engine.api.EngineConfig;
import org.eclipse.birt.report.engine.api.IEngineConfig;
import org.eclipse.birt.report.engine.api.IReportEngine;
import org.eclipse.birt.report.engine.api.IReportEngineFactory;
import org.springframework.beans.BeansException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;

import java.util.logging.Level;


@SpringBootApplication(exclude = {MongoAutoConfiguration.class})
public class HbtPowerReportServiceApplication implements ApplicationContextAware {

    private ApplicationContext context;

    private static final Logger LOG = LogManager.getLogger(HbtPowerReportServiceApplication.class);

    @Bean(name = "birtEngine")
    public IReportEngine birtEngine() {
        LOG.info("Initializing BIRT engine.");
        IReportEngine engine;
        try {
            EngineConfig config = new EngineConfig();
            //noinspection unchecked
            config.getAppContext().put("spring", this.context);
            config.setProperty(IEngineConfig.LOG_LEVEL, Level.OFF);
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

    public static void main(String[] args) {
        SpringApplication.run(HbtPowerReportServiceApplication.class, args);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.context = applicationContext;
    }
}
