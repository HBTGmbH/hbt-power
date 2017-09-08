package de.hbt.pwr.view.exception;

import de.hbt.pwr.view.model.ViewProfile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Represents a very general error that is forwarded to the service user in a machine interpretable format.
 * The {@link ServiceOuterError#innerError} represents more information that are specific to the exception.
 *
 * @see <a href="https://github.com/Microsoft/api-guidelines/blob/vNext/Guidelines.md#710-response-formats">Microsoft API Guidelines</a>
 * @see ViewProfileExceptionHandler
 * @author nt (nt@hbt.de)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class ServiceOuterError {
    /**
     * Usually the HTTP Status code, redundantly stored in the error class
     */
    private String code;

    /**
     * This is the message that was provided in the exception and describes the problem in a concise notation
     * that the developer (= the service user) understands
     */
    private String message;

    /**
     * The class which is affected by this problem. When, for example, a {@link ViewProfile} isn't available, the
     * target is "ViewProfile"
     */
    private String target;

    /**
     * More detailed, exception specific information. Because there is no way to store this information with type-safety,
     * it is simply stored as object. Serialization to JSON is done by Jackson, which does not need type information anyway.
     */
    private Object innerError;
}
