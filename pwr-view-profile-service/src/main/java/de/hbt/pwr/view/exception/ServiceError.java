package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Represents a general service error that wraps a {@link ServiceOuterError} in a machine
 * readable format.
 *
 * @see ViewProfileExceptionHandler
 * @see ServiceOuterError
 *
 * @author nt (nt@hbt.de)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServiceError {
    @JsonProperty("error")
    public ServiceOuterError serviceOuterError;
}
