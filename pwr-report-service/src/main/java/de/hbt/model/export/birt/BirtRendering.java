package de.hbt.model.export.birt;

import de.hbt.exceptions.ReportRenderException;
import org.eclipse.birt.report.engine.api.EngineConstants;
import org.eclipse.birt.report.engine.api.IRenderOption;
import org.eclipse.birt.report.engine.api.IReportEngine;
import org.eclipse.birt.report.engine.api.IReportRunnable;
import org.eclipse.birt.report.engine.api.IRunAndRenderTask;
import org.eclipse.birt.report.model.api.OdaDataSourceHandle;
import org.eclipse.birt.report.model.api.ReportDesignHandle;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Runs a report design against an XML data source and renders it into memory.
 */
final class BirtRendering {

    private BirtRendering() {
    }

    /**
     * @param timeLimit a design with an element higher than the page makes BIRT add pages forever (PDF); the task is
     *                  cancelled after this time
     */
    static byte[] render(IReportEngine birtEngine, InputStream designFileStream, String xmlDataSourcePath,
                         IRenderOption options, Duration timeLimit) {
        IRunAndRenderTask task;
        try {
            IReportRunnable design = birtEngine.openReportDesign(designFileStream);
            ReportDesignHandle report = (ReportDesignHandle) design.getDesignHandle();
            OdaDataSourceHandle dataSourceHandle = (OdaDataSourceHandle) report.findDataSource("Profil Data Source");
            dataSourceHandle.setProperty("FILELIST", xmlDataSourcePath);
            dataSourceHandle.setProperty("ENCODINGLIST", "UTF-8");
            task = birtEngine.createRunAndRenderTask(design);
        } catch (Exception e) {
            throw new ReportRenderException("Report design could not be opened: " + e.getMessage(), e);
        }
        task.getAppContext().put(EngineConstants.APPCONTEXT_CLASSLOADER_KEY, BirtRendering.class.getClassLoader());
        // Only the stream: with an output file name as well, BIRT writes into the stream and leaves an empty file
        CancellableOutputStream outputStream = new CancellableOutputStream();
        options.setOutputStream(outputStream);
        task.setRenderOption(options);

        Throwable failure = runWithTimeLimit(task, outputStream, timeLimit);
        if (failure != null) {
            throw new ReportRenderException("Report design could not be rendered: " + failure.getMessage(), failure);
        }
        return outputStream.toByteArray();
    }

    /**
     * Runs and closes the task in its own thread (BIRT's script engine is bound to the thread that runs it).
     *
     * @return the first error, if any
     */
    private static Throwable runWithTimeLimit(IRunAndRenderTask task, CancellableOutputStream outputStream, Duration timeLimit) {
        AtomicReference<Throwable> failure = new AtomicReference<>();
        Thread worker = new Thread(() -> {
            try {
                task.run();
                // BIRT collects errors (e.g. a missing data source) instead of throwing them
                List<?> errors = task.getErrors();
                if (!errors.isEmpty()) {
                    failure.set((Throwable) errors.get(0));
                }
            } catch (Exception e) {
                failure.set(e);
            } finally {
                task.close();
            }
        }, "birt-render");
        // BIRT loads its extensions through the context class loader (Spring Boot jar)
        worker.setContextClassLoader(Thread.currentThread().getContextClassLoader());
        worker.setDaemon(true);
        worker.start();
        try {
            worker.join(timeLimit.toMillis());
            if (worker.isAlive()) {
                // task.cancel() alone does not stop BIRT's page layout; the next page it writes does
                outputStream.cancel();
                task.cancel();
                worker.join(Duration.ofSeconds(10).toMillis());
                throw new ReportRenderException("Rendering took longer than " + timeLimit.getSeconds()
                        + " s and was cancelled; an element of the design may be higher than the page", null);
            }
        } catch (InterruptedException e) {
            outputStream.cancel();
            task.cancel();
            Thread.currentThread().interrupt();
            throw new ReportRenderException("Rendering was interrupted", e);
        }
        return failure.get();
    }

    /**
     * Refuses further output once cancelled, which ends a rendering that does not react to IEngineTask.cancel()
     */
    private static final class CancellableOutputStream extends ByteArrayOutputStream {

        private volatile boolean cancelled;

        void cancel() {
            cancelled = true;
        }

        @Override
        public synchronized void write(int b) {
            checkNotCancelled();
            super.write(b);
        }

        @Override
        public synchronized void write(byte[] b, int off, int len) {
            checkNotCancelled();
            super.write(b, off, len);
        }

        private void checkNotCancelled() {
            if (cancelled) {
                throw new ReportRenderException("Rendering was cancelled", null);
            }
        }
    }
}
