package de.hbt.exceptions;

/**
 * BIRT could not render a report design.
 */
public class ReportRenderException extends RuntimeException {

    public ReportRenderException(String message, Throwable cause) {
        super(message, cause);
    }
}
