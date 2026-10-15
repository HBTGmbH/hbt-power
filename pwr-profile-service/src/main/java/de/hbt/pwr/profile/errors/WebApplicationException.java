package de.hbt.pwr.profile.errors;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class WebApplicationException extends RuntimeException {
    private final HttpStatus status;
    private final String message;

    public WebApplicationException(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
