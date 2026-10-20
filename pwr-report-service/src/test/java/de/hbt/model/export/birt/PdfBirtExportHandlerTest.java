package de.hbt.model.export.birt;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class PdfBirtExportHandlerTest {

    private static byte[] pdf(String content) {
        return content.getBytes(StandardCharsets.ISO_8859_1);
    }

    @Test
    void finishedPdfEndsWithEof() {
        assertThat(PdfBirtExportHandler.isComplete(pdf("%PDF-1.5\n...\nstartxref\n1234\n%%EOF\n"))).isTrue();
        assertThat(PdfBirtExportHandler.isComplete(pdf("%PDF-1.5\n...\n%%EOF"))).isTrue();
    }

    /**
     * What BIRT left behind when iText could not embed a font: images written, the rest missing
     */
    @Test
    void unfinishedPdfIsDetected() {
        assertThat(PdfBirtExportHandler.isComplete(pdf("%PDF-1.5\n1 0 obj\n<</Type/XObject>>stream\n..."))).isFalse();
        assertThat(PdfBirtExportHandler.isComplete(new byte[0])).isFalse();
    }
}
