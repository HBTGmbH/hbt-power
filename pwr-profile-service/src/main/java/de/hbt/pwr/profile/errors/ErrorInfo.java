package de.hbt.pwr.profile.errors;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.util.Date;

/**
 * Error information to be serialized as JSON in the response in case of an error.
 */
@Data
@ApiModel(value = "Standard format for error information")
public class ErrorInfo {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private Date timestamp = new Date();
    private int status;
    private String error;
    private String message;
    private String path;

    public ErrorInfo(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }
}
