package de.hbt.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ReportServiceConfigTest {

    /**
     * A broken design (an element higher than the page) shows its error after 10 s, not after a minute (#155)
     */
    @Test
    void shouldCancelPreviewAfterTenSeconds() {
        assertThat(new ReportServiceConfig().getPreviewTimeLimitSeconds()).isEqualTo(10);
    }
}
