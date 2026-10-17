package de.hbt.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;

import java.time.Instant;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@JsonTest
class ReportDataTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldSetCreatedAtOnCreation() {
        Instant before = Instant.now();

        ReportData reportData = new ReportData("tst", "Test", "Test.docx", "template");

        assertThat(reportData.getCreatedAt()).isBetween(before, Instant.now());
    }

    @Test
    @SneakyThrows
    void shouldSerializeCreatedAtAsInstantInSlice() {
        ReportData reportData = new ReportData("tst", "Test", "Test.docx", "template");
        reportData.setCreateDate(LocalDate.of(2026, 10, 17));
        reportData.setCreatedAt(Instant.parse("2026-10-17T21:45:00Z"));

        String json = objectMapper.writeValueAsString(ReportData.ReportDataSlice.toReportDataSlice(reportData));

        assertThat(json)
                .contains("\"createDate\":\"2026-10-17\"")
                .contains("\"createdAt\":\"2026-10-17T21:45:00Z\"");
    }

    @Test
    @SneakyThrows
    void shouldSerializeMissingCreatedAtAsNull() {
        ReportData reportData = new ReportData("tst", "Test", "Test.docx", "template");
        reportData.setCreatedAt(null);

        String json = objectMapper.writeValueAsString(ReportData.ReportDataSlice.toReportDataSlice(reportData));

        assertThat(json).contains("\"createdAt\":null");
    }
}
