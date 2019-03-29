package de.hbt.pwr.profile.errors;

import org.junit.Test;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

public class WebApplicationExceptionMapperTest {

    @Test
    public void shouldMapValidationException_toErrorInfo() {
        WebApplicationExceptionMapper mapper = new WebApplicationExceptionMapper();
        ResponseEntity<ErrorInfo> infos = mapper.toResponse(new PwrValidationException(Arrays.asList("Test")));
        assertThat(infos.getBody())
                .extracting(ErrorInfo::getMessage, ErrorInfo::getError, ErrorInfo::getStatus)
                .contains("Test", "Validation failed", 400);
    }

}